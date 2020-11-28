#!perl
use strict;
use warnings;
use JSON;

=pod

Conversion du tableau "techniques.tsv" en structure JSON utilisée dans
l'application web.

=cut

my $code_waza    = "A";
my $code_attaque = 1;

my ( $last_waza, $last_attaque );

my $data = {};

# Tri des attaques dans le même ordre
my %attaques_sort = (
    ai_hanmi_katate_dori    => 1,
    katate_dori             => 2,
    kata_dori               => 3,
    muna_dori               => 4,
    ryote_dori              => 5,
    katate_ryote_dori       => 6,
    ryo_kata_dori           => 7,

    shomen_uchi             => 8,
    yokomen_uchi            => 9,
    kata_dori_menuchi       => 10,

    chudan_tsuki            => 11,
    jodan_tsuki             => 12,
    mae_geri                => 13,

    ushiro_eri_dori         => 14,
    ushiro_ryote_dori       => 15,
    ushiro_ryo_kata_dori    => 16,
    ushiro_hiji_dori        => 17,
    ushiro_katate_kubishime => 18,
    ushiro_kiri_otoshi      => 19,
);

# Tri des techniques dans le même ordre
my %tech_sort = (
    ikkyo              => 1,
    nikyo              => 2,
    sankyo             => 3,
    yonkyo             => 4,
    gokyo              => 5,

    irimi_nage         => 6,
    sokumen_irimi_nage => 7,
    shiho_nage         => 8,
    kote_gaeshi        => 9,
    ude_kime_nage      => 10,
    kaiten_nage        => 11,
    uchi_kaiten_nage   => 12,
    soto_kaiten_nage   => 13,
    tenchi_nage        => 14,
    koshi_nage         => 15,
    kokyu_nage         => 16,
    uchi_kaiten_sankyo => 17,
    aiki_otoshi        => 18,
    hiji_kime_osae     => 19,
    juji_garami        => 20,
    kokyu_ho           => 21,
    sumi_otoshi        => 22,
    ushiro_kiri_otoshi => 23,
);

my ( %waza, %attaques );

open( my $tsv, "<:encoding(UTF-8)", "techniques.csv" ) or die "Cannot open tsv file: $!\n";

open( my $yt_list, ">:encoding(UTF-8)", "youtube_list.tsv" ) or die "Cannot open tsv file: $!\n";


my $i = 0;
while (<$tsv>) {
    chomp;
    next unless /\S/;
    next if /^\s*"?\s*#/;
    next if /^(\s*,\s*)+$/;

    my ( $waza, $attaque, $technique, $extra, $tag, $kyu_ffaaa, $youtube, $start_frame, $end_frame, $index ) =
      split( /,/, $_ );

    next unless $technique;
    next unless $kyu_ffaaa;

    my $kyu_ffab = undef;

    $i++;
    print STDERR "$i\t$waza\t$attaque\t$technique\t$extra\n";

    $waza{$waza}++;
    $attaques{$attaque}++;

    if ( $last_waza && $last_waza ne $waza ) {
        $code_waza++;
        $code_attaque = 1;
    }
    if ( $last_attaque && $last_attaque ne $attaque ) {
        $code_attaque++;
    }

    my $code = "$code_waza$code_attaque-$attaque";

    my $titre = join(" - ", fix_name($waza), fix_name($attaque), fix_name($technique), fix_name($extra));

    $titre =~ s/ - $//;
    $titre =~ s/( - )+/ - /g;

    my $id = join('-', $waza, $attaque, $technique, fix_extra($extra));
    $id =~ s/-+$//;
    $id =~ s/--+/-/g;

    if ($kyu_ffaaa) {
        $kyu_ffaaa += 0;
    } else {
        $kyu_ffaaa = JSON::null;
    }

    if ($kyu_ffab) {
        $kyu_ffab += 0;
    } else {
        $kyu_ffab = JSON::null;
    }

    $youtube =~ s/^\s*|\s*$//g;

    push(
        @{ $data->{catalogue} },
        {
            code       => $code,
            waza       => $waza,    
            attaque    => $attaque,
            technique  => $technique,
            extra      => $extra || JSON::null,
            id         => $id,
            youtube    => $youtube || JSON::null,
            titre      => $titre,
            important  => $tag eq 'S' ? JSON::true : JSON::false,
            #kyu => [ $kyu_ffaaa, $kyu_ffab ],
            kyu => $kyu_ffaaa,
            only_kyu => $tag eq 'K' ? JSON::true : JSON::false,
        }
    );

    print $yt_list "$youtube\t$titre\n" if $youtube;

=pod

    push( @{ $data->{waza}->{$waza}->{$attaque} }, $technique );

    if ($kyu_ffaaa) {
        push(
            @{ $data->{ffaaa}->{$kyu_ffaaa}->{$waza}->{$attaque} },
            $technique
        );
    }
    if ($kyu_ffab) {
        push( @{ $data->{ffab}->{$kyu_ffab}->{$waza}->{$attaque} },
            $technique );
    }
=cut

    #print join("\t", $code, $waza, $attaque, $technique, "<$tag>") . "\n";

    $last_waza    = $waza;
    $last_attaque = $attaque;
}

#foreach my $attaque ( sort keys %attaques ) {
#    print qq'<option value="$attaque">' . fix_name($attaque) . qq'</option>\n';
#}
#foreach my $tech (sort { $tech_sort{$a} <=> $tech_sort{$b} } keys %tech_sort) {
#   print qq'<option value="$tech">' . fix_name($tech) . qq'</option>\n';
#}

# Tri des différentes structures

=pod

foreach my $waza ( keys %waza ) {
    foreach my $attaque ( keys %attaques ) {
        my $techs = $data->{waza}->{$waza}->{$attaque};
        if ($techs) {
            @{$techs} = sort { $tech_sort{$a} <=> $tech_sort{$b} } @{$techs};
        }
    }
}

foreach my $fede (qw(ffaaa ffab)) {
    foreach my $kyu ( 1 .. 5 ) {
        foreach my $waza ( keys %waza ) {
            foreach my $attaque ( keys %attaques ) {
                my $techs = $data->{$fede}->{$kyu}->{$waza}->{$attaque};
                if ($techs) {
                    @{$techs} =
                      sort { $tech_sort{$a} <=> $tech_sort{$b} } @{$techs};
                }
            }
        }
    }
}

=cut

open( my $json_file, ">", "../data/aikido_catalogue.json" )
  or die "Cannot create json file: $!\n";
print $json_file to_json( $data, { ascii => 1, pretty => 1 } );

# Fix effectué en JS client
sub fix_name {
    my $s = shift;
    $s =~ s/_/ /g;
    $s =~ s/ai\s*hanmi/ai-hanmi/;
    ucfirst($s);
}

sub fix_extra {
    my $s = lc(shift);
    $s =~ s/\W/_/g;
    $s;
}


