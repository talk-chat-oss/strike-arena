import React from "react";

export interface ClubVisual {
  name: string;
  shortName: string;
  crestUrl: string;
  primaryColor: string;
  secondaryColor: string;
  country: string;
}

/**
 * Catálogo oficial completo de Brasões / Escudos de Clubes (EA SPORTS FC & eFootball)
 * Inclui 166 clubes oficiais das ligas europeias, saudita, MLS, sul-americanas e Brasileirão.
 */
export const CLUB_CRESTS: Record<string, ClubVisual> = {
  "Real Madrid": {
    "name": "Real Madrid",
    "shortName": "RMA",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    "primaryColor": "#FEBE10",
    "secondaryColor": "#00529F",
    "country": "ESP"
  },
  "Manchester City": {
    "name": "Manchester City",
    "shortName": "MCI",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    "primaryColor": "#6CABDD",
    "secondaryColor": "#1C2C5B",
    "country": "ENG"
  },
  "FC Barcelona": {
    "name": "FC Barcelona",
    "shortName": "BAR",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    "primaryColor": "#A50044",
    "secondaryColor": "#004D98",
    "country": "ESP"
  },
  "Bayern München": {
    "name": "Bayern München",
    "shortName": "BAY",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
    "primaryColor": "#DC052D",
    "secondaryColor": "#0066B2",
    "country": "GER"
  },
  "Arsenal": {
    "name": "Arsenal",
    "shortName": "ARS",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    "primaryColor": "#EF0107",
    "secondaryColor": "#063672",
    "country": "ENG"
  },
  "Liverpool": {
    "name": "Liverpool",
    "shortName": "LIV",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
    "primaryColor": "#C8102E",
    "secondaryColor": "#00B2A9",
    "country": "ENG"
  },
  "Paris Saint-Germain": {
    "name": "Paris Saint-Germain",
    "shortName": "PSG",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    "primaryColor": "#004170",
    "secondaryColor": "#DA291C",
    "country": "FRA"
  },
  "Inter de Milão": {
    "name": "Inter de Milão",
    "shortName": "INT",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
    "primaryColor": "#010E80",
    "secondaryColor": "#000000",
    "country": "ITA"
  },
  "Chelsea": {
    "name": "Chelsea",
    "shortName": "CHE",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
    "primaryColor": "#034694",
    "secondaryColor": "#DBA111",
    "country": "ENG"
  },
  "Flamengo": {
    "name": "Flamengo",
    "shortName": "FLA",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg",
    "primaryColor": "#C52613",
    "secondaryColor": "#000000",
    "country": "BRA"
  },
  "Palmeiras": {
    "name": "Palmeiras",
    "shortName": "PAL",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
    "primaryColor": "#006437",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Corinthians": {
    "name": "Corinthians",
    "shortName": "COR",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/5/5a/Sport_Club_Corinthians_Paulista_crest.svg",
    "primaryColor": "#111111",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "São Paulo": {
    "name": "São Paulo",
    "shortName": "SAO",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg",
    "primaryColor": "#FE0000",
    "secondaryColor": "#000000",
    "country": "BRA"
  },
  "Botafogo": {
    "name": "Botafogo",
    "shortName": "BOT",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg",
    "primaryColor": "#000000",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Atlético Mineiro": {
    "name": "Atlético Mineiro",
    "shortName": "CAM",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Atletico_mineiro_galo.png",
    "primaryColor": "#000000",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Grêmio": {
    "name": "Grêmio",
    "shortName": "GRE",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/en/f/f1/Gremio.svg",
    "primaryColor": "#0D80BF",
    "secondaryColor": "#000000",
    "country": "BRA"
  },
  "Internacional": {
    "name": "Internacional",
    "shortName": "SCI",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg",
    "primaryColor": "#E30613",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Cruzeiro": {
    "name": "Cruzeiro",
    "shortName": "CRU",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/9/90/Cruzeiro_Esporte_Clube_%28logo%29.svg",
    "primaryColor": "#0033A0",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Fluminense": {
    "name": "Fluminense",
    "shortName": "FLU",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fluminense_FC_escudo.png",
    "primaryColor": "#8A0538",
    "secondaryColor": "#00613C",
    "country": "BRA"
  },
  "Vasco da Gama": {
    "name": "Vasco da Gama",
    "shortName": "VAS",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/pt/a/ac/CRVascodaGama.png",
    "primaryColor": "#000000",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Santos": {
    "name": "Santos",
    "shortName": "SAN",
    "crestUrl": "https://upload.wikimedia.org/wikipedia/commons/3/35/Santos_logo.svg",
    "primaryColor": "#000000",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Bahia": {
    "name": "Bahia",
    "shortName": "BAH",
    "crestUrl": "https://images.fotmob.com/image_resources/logo/teamlogo/9777.png",
    "primaryColor": "#003399",
    "secondaryColor": "#E30613",
    "country": "BRA"
  },
  "Fortaleza": {
    "name": "Fortaleza",
    "shortName": "FOR",
    "crestUrl": "https://images.fotmob.com/image_resources/logo/teamlogo/8287.png",
    "primaryColor": "#11519B",
    "secondaryColor": "#E30613",
    "country": "BRA"
  },
  "Athletico Paranaense": {
    "name": "Athletico Paranaense",
    "shortName": "CAP",
    "crestUrl": "https://images.fotmob.com/image_resources/logo/teamlogo/10273.png",
    "primaryColor": "#CE181E",
    "secondaryColor": "#000000",
    "country": "BRA"
  },
  "Red Bull Bragantino": {
    "name": "Red Bull Bragantino",
    "shortName": "RBB",
    "crestUrl": "https://images.fotmob.com/image_resources/logo/teamlogo/109705.png",
    "primaryColor": "#D00027",
    "secondaryColor": "#FFFFFF",
    "country": "BRA"
  },
  "Atlético de Madrid": {
    "name": "Atlético de Madrid",
    "shortName": "ATL",
    "crestUrl": "https://drop-assets.ea.com/images/vYcueolPvaGx8blMqhPZ5/5dc3479fc8b85d475fd980c53fc2056f/l240.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Borussia Dortmund": {
    "name": "Borussia Dortmund",
    "shortName": "BOR",
    "crestUrl": "https://drop-assets.ea.com/images/TmqxUZk2FrbFXOK1kdE89/3dce225926ac7cfd9f283ecd731fa710/l22.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SSC Napoli": {
    "name": "SSC Napoli",
    "shortName": "SSC",
    "crestUrl": "https://drop-assets.ea.com/images/2FIV26KpnSXl3Nv8Ar6jk3/d8461aa150da3d433fccc34bc80c978f/l48.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Man Utd": {
    "name": "Man Utd",
    "shortName": "MAN",
    "crestUrl": "https://drop-assets.ea.com/images/5xxJeUfFY6FEQZEJyJK35/990979becf88b88ecb6461dc441c2ebf/l11.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "AC Milan": {
    "name": "AC Milan",
    "shortName": "ACM",
    "crestUrl": "https://drop-assets.ea.com/images/6D3s1RlLRER3UOunC4Lofv/ec87a4178160a87521b0b7c688e7638e/l131681.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Galatasaray": {
    "name": "Galatasaray",
    "shortName": "GAL",
    "crestUrl": "https://drop-assets.ea.com/images/6P5sN0m3ZRE23vjlT8gh5q/f7f9acf3a7be5ea12f889d93dbdfd48f/l325.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "AS Roma": {
    "name": "AS Roma",
    "shortName": "ASR",
    "crestUrl": "https://drop-assets.ea.com/images/2ruQP0TDYcCmtVFKr9qMBI/5f53795056598b1faac31300900b8671/l52.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Newcastle Utd": {
    "name": "Newcastle Utd",
    "shortName": "NEW",
    "crestUrl": "https://drop-assets.ea.com/images/69fXoaX4p9zFwKaZYoNtNX/14d86649a9b5a3f7e876cc3d46357b5d/l13.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Inter Miami CF": {
    "name": "Inter Miami CF",
    "shortName": "INT",
    "crestUrl": "https://drop-assets.ea.com/images/3luAerlx8cliy5XNziWvOA/b7785fb1a6915d5044b4f954d83e4915/l112893.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Athletic Club": {
    "name": "Athletic Club",
    "shortName": "ATH",
    "crestUrl": "https://drop-assets.ea.com/images/5lGGXYvaOCdAYlo8xWPzQb/7092243785809519c68b482ad21b2c41/l448.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Fenerbahçe": {
    "name": "Fenerbahçe",
    "shortName": "FEN",
    "crestUrl": "https://drop-assets.ea.com/images/3sfoNHvqDPqhM1PsEE1sNM/b9dcc82d0e2fba3efc8e8d0ed4c216a6/l326.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Aston Villa": {
    "name": "Aston Villa",
    "shortName": "AST",
    "crestUrl": "https://drop-assets.ea.com/images/57c0ppYsEA88xL0gxqce8K/99605df97c6a96ea3b6e8a424c217af0/l2.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Ittihad": {
    "name": "Al Ittihad",
    "shortName": "ALI",
    "crestUrl": "https://drop-assets.ea.com/images/21L35ZnVrrvEeFouMeqs8Q/b631b443b4d37e1712ed79f2487d850c/l607.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "RB Leipzig": {
    "name": "RB Leipzig",
    "shortName": "RBL",
    "crestUrl": "https://drop-assets.ea.com/images/1EoW6b2VkhiP3S0vqikd9s/f181f899a2037360f70a9a8aba18af30/l112172.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Fiorentina": {
    "name": "Fiorentina",
    "shortName": "FIO",
    "crestUrl": "https://drop-assets.ea.com/images/j2Zuc19dll43zq88V7CgZ/d2e748909a451985aed5a26b122a4d8f/l110374.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "LAFC": {
    "name": "LAFC",
    "shortName": "LAF",
    "crestUrl": "https://drop-assets.ea.com/images/7HVxXj38u4xwAYPYjnYeBm/dd7c8333fd89f025a52fa53a96406475/l112996.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Sunderland": {
    "name": "Sunderland",
    "shortName": "SUN",
    "crestUrl": "https://drop-assets.ea.com/images/6ja62Iw2LyY8cVrud4aSHi/aa6c15e4a2ceed66f92099108bea9dfa/l106.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Nassr": {
    "name": "Al Nassr",
    "shortName": "ALN",
    "crestUrl": "https://drop-assets.ea.com/images/6oPkjdKPFc4aHfFp7UGXB7/262e529bd81a51c0b5f317e61b3f5985/l112139.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Leverkusen": {
    "name": "Leverkusen",
    "shortName": "LEV",
    "crestUrl": "https://drop-assets.ea.com/images/mGqQw1um1ucUAshcK0Eop/9c7fe656f526c98b217ff2a052377b5c/l32.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Juventus": {
    "name": "Juventus",
    "shortName": "JUV",
    "crestUrl": "https://drop-assets.ea.com/images/6zWQmPATtK8lpsiXbKb3mY/6b2d1dab08ef14f63271a5cd70a0db0d/l45.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Hilal": {
    "name": "Al Hilal",
    "shortName": "ALH",
    "crestUrl": "https://drop-assets.ea.com/images/S6sbDN9mfGaVn2VJDekYR/c6f580c98a0d614b0b308a89a241c6ab/l605.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Everton": {
    "name": "Everton",
    "shortName": "EVE",
    "crestUrl": "https://drop-assets.ea.com/images/6Cth6wtCt1i37ZjPMZKIm3/4c68def58bf71a34afa1870cad4d5cfe/l7.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "OM": {
    "name": "OM",
    "shortName": "OM",
    "crestUrl": "https://drop-assets.ea.com/images/3t06Qm41tT2gB8NqJYXdue/928373951a71a9a8565497e6481925d1/l219.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SS Lazio": {
    "name": "SS Lazio",
    "shortName": "SSL",
    "crestUrl": "https://drop-assets.ea.com/images/APtVhL3q3cFDG9pkum0Q4/d134408d82f08f814e1bbb8bfc3b4267/l115841.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Spurs": {
    "name": "Spurs",
    "shortName": "SPU",
    "crestUrl": "https://drop-assets.ea.com/images/7kUcyCh5xGrzQlcjP2Q9NH/11aba507486f44765ee5938b1b5b097e/l18.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "FC Porto": {
    "name": "FC Porto",
    "shortName": "FCP",
    "crestUrl": "https://drop-assets.ea.com/images/3rIoG9U8fPPfaXZiGOGtvw/37c0c0ceefe454e9c299d4cc1852671f/l236.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Atalanta": {
    "name": "Atalanta",
    "shortName": "ATA",
    "crestUrl": "https://drop-assets.ea.com/images/19gWEcyonp2fvk02MNHZOA/83b82283fc62f7010b529a53a0724eee/l115845.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Real Betis": {
    "name": "Real Betis",
    "shortName": "REA",
    "crestUrl": "https://drop-assets.ea.com/images/4rODtg2WvYGHhUGfPXxilW/e047163865b561a0ced87f9f593498c1/l449.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Ahli": {
    "name": "Al Ahli",
    "shortName": "ALA",
    "crestUrl": "https://drop-assets.ea.com/images/3lVk0osL7o6YMhHuK4YYD6/5e106847b59ce2a4f0bfb55988d812c3/l112387.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Sporting CP": {
    "name": "Sporting CP",
    "shortName": "SPO",
    "crestUrl": "https://drop-assets.ea.com/images/2bL9oGApMvbYE1o0Byl8KB/c914cde8141f11124f026cb198a0eb00/l237.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Villarreal CF": {
    "name": "Villarreal CF",
    "shortName": "VIL",
    "crestUrl": "https://drop-assets.ea.com/images/xvk9pCQTX74mWG8EjcgYU/f631ffd2c7ac06bd43f2547fc44463c4/l483.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Real Sociedad": {
    "name": "Real Sociedad",
    "shortName": "REA",
    "crestUrl": "https://drop-assets.ea.com/images/2ohvULVVtNoXptjhNS2dLq/08d0f2d7ecfd9e0f43ce837a4e73d139/l457.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "TSG Hoffenheim": {
    "name": "TSG Hoffenheim",
    "shortName": "TSG",
    "crestUrl": "https://drop-assets.ea.com/images/1ylwMQ1ia5SGcXYoIKhtdK/b24a8fed6fb30e01ea3fd15184b0046c/l10029.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Nott'm Forest": {
    "name": "Nott'm Forest",
    "shortName": "NOT",
    "crestUrl": "https://drop-assets.ea.com/images/60CgBQCMt7Dtcjip9xUxg8/5fa49387c380bf4772138b215ef4fd85/l14.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "West Ham": {
    "name": "West Ham",
    "shortName": "WES",
    "crestUrl": "https://drop-assets.ea.com/images/60X4vXPDgGISHaqyOdUGkg/c7def9840658d49d646e4895e9e04e94/l19.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "VfB Stuttgart": {
    "name": "VfB Stuttgart",
    "shortName": "VFB",
    "crestUrl": "https://drop-assets.ea.com/images/5kfh9LrPvDQKbQNF6k7CSF/9a70e7082aaba3b46ea8bd1e699f62de/l36.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Celta": {
    "name": "Celta",
    "shortName": "CEL",
    "crestUrl": "https://drop-assets.ea.com/images/3t0uDwxQg2iWoXop58je1a/d5c49ec269ace3a1ad2ded5fb2e8a9ec/l450.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Qadsiah": {
    "name": "Al Qadsiah",
    "shortName": "ALQ",
    "crestUrl": "https://drop-assets.ea.com/images/OQhve5ubflu5c5OXWRlUV/4874b82f2bab16f04e6702812ac521a6/l112391.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Beşiktaş": {
    "name": "Beşiktaş",
    "shortName": "BEI",
    "crestUrl": "https://drop-assets.ea.com/images/Sx4dfrxgLrl3y1lm5Wj8p/fe2d92ed674ea49ea5ee3ac8d9842897/l327.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "AS Monaco": {
    "name": "AS Monaco",
    "shortName": "ASM",
    "crestUrl": "https://drop-assets.ea.com/images/6XicH1VsjyR3WbTdpk99p3/8b11b6c53072e6c9c042eb77f3c6a8f4/l69.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Fulham": {
    "name": "Fulham",
    "shortName": "FUL",
    "crestUrl": "https://drop-assets.ea.com/images/1YL8ULAZyOPtffpFGZcGe8/84ec5701079276f33aa349d253fa0321/l144.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Brighton": {
    "name": "Brighton",
    "shortName": "BRI",
    "crestUrl": "https://drop-assets.ea.com/images/1mFLMjuFkxQjbRaTLKZ8Gm/277b9eb6d29d37064d1d82063b06f681/l1808.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SL Benfica": {
    "name": "SL Benfica",
    "shortName": "SLB",
    "crestUrl": "https://drop-assets.ea.com/images/2DamHkQ1ZP1CYVjFPp6ofg/3e07292021842fdadb7aaaa84e7473aa/l234.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Bologna": {
    "name": "Bologna",
    "shortName": "BOL",
    "crestUrl": "https://drop-assets.ea.com/images/46WRpnCKdCAJlQHuRwlxXF/a7ac6606d8a808d382d4dd5c484eb60e/l189.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Frankfurt": {
    "name": "Frankfurt",
    "shortName": "FRA",
    "crestUrl": "https://drop-assets.ea.com/images/3KK76lJIZtlRnPaAgbD85V/5614e02825eb0ed03b69a9d078e40db9/l1824.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Rosario Central": {
    "name": "Rosario Central",
    "shortName": "ROS",
    "crestUrl": "https://drop-assets.ea.com/images/4A7PCwuGJb5YWjRaD4BuXm/f4161b7e626811f4379ebbc4d28abd15/l110580.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Sassuolo": {
    "name": "Sassuolo",
    "shortName": "SAS",
    "crestUrl": "https://drop-assets.ea.com/images/1XH03NyWoyYHO0EH69QYG4/fe0a0c7effe48754e97248d04e352f4e/l111974.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Crystal Palace": {
    "name": "Crystal Palace",
    "shortName": "CRY",
    "crestUrl": "https://drop-assets.ea.com/images/6j7pLWl2t3yl13bu6Y9s5K/91a346d14011a610d95ec956816b6a38/l1799.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Torino": {
    "name": "Torino",
    "shortName": "TOR",
    "crestUrl": "https://drop-assets.ea.com/images/hSLWPIkJFJBzTMyk85qej/40d38d4675390d6677c4f17dddae5627/l54.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SC Freiburg": {
    "name": "SC Freiburg",
    "shortName": "SCF",
    "crestUrl": "https://drop-assets.ea.com/images/TnclXkBIoI1MtJBmRvObq/83167db02b49b274917cec5814510b79/l25.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "CA Osasuna": {
    "name": "CA Osasuna",
    "shortName": "CAO",
    "crestUrl": "https://drop-assets.ea.com/images/5T0gPuxPGVG3BLEP9wYxLx/8be8ef52e215bc47956d1084f702409d/l479.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "RCD Mallorca": {
    "name": "RCD Mallorca",
    "shortName": "RCD",
    "crestUrl": "https://drop-assets.ea.com/images/3M8ak3PmmUDRXsH9mryxH9/54d5da4b609ccf51bd0564abad99cc0e/l453.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "OL": {
    "name": "OL",
    "shortName": "OL",
    "crestUrl": "https://drop-assets.ea.com/images/s2BAEtejMk8pyJDqN3uyR/9938fd597d35ed59158d5b441aa07455/l66.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Shabab": {
    "name": "Al Shabab",
    "shortName": "ALS",
    "crestUrl": "https://drop-assets.ea.com/images/VTUgGrOQD2Ao8gd3KhDfS/d43f1f7d0af58701cce9229eb9771652/l111674.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Valencia CF": {
    "name": "Valencia CF",
    "shortName": "VAL",
    "crestUrl": "https://drop-assets.ea.com/images/3rBiULK7uv6Uim0qpaPGXG/123be59c7edf775fa3df08effc267f43/l461.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Paris FC": {
    "name": "Paris FC",
    "shortName": "PAR",
    "crestUrl": "https://drop-assets.ea.com/images/3q4gMefpvBrGdVOPMxk1dD/d310abcaf71d2a45ee4362b169469a93/l111817.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "1. FSV Mainz 05": {
    "name": "1. FSV Mainz 05",
    "shortName": "FSV",
    "crestUrl": "https://drop-assets.ea.com/images/4QO9B5tBI7mcWhzDDO3b6N/f70a1fd45fb4a6dd80ceea61a3e91c4d/l169.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Getafe CF": {
    "name": "Getafe CF",
    "shortName": "GET",
    "crestUrl": "https://drop-assets.ea.com/images/44YMNWepTyO6Bq40e9JFvy/a282461a849f13c104c8163cd2253e2a/l1860.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Leeds United": {
    "name": "Leeds United",
    "shortName": "LEE",
    "crestUrl": "https://drop-assets.ea.com/images/4GwGagnihmCNc321tRi8qB/07ddd8a7768922d58f01c2b6f2964a18/l8.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SC Braga": {
    "name": "SC Braga",
    "shortName": "SCB",
    "crestUrl": "https://drop-assets.ea.com/images/4qjtfL57Y3CxvssFaOwnJT/08cfda01d445741b93fd0f8163a4b267/l1896.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Rayo Vallecano": {
    "name": "Rayo Vallecano",
    "shortName": "RAY",
    "crestUrl": "https://drop-assets.ea.com/images/3SSzCmmavBBvrdJVySdnrm/f51360f07320e2dba9520037d3789543/l480.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Lecce": {
    "name": "Lecce",
    "shortName": "LEC",
    "crestUrl": "https://drop-assets.ea.com/images/24tjxIlBXF6g0puyjqRqqx/04aa5e48c5938944bee35b1893c0d0fa/l347.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Como": {
    "name": "Como",
    "shortName": "COM",
    "crestUrl": "https://drop-assets.ea.com/images/3y8mulzaICjwfi7inFVld2/ec9c71566982f8df59f26e81745143ec/l1745.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "M'gladbach": {
    "name": "M'gladbach",
    "shortName": "MGL",
    "crestUrl": "https://drop-assets.ea.com/images/4eJmGBw11G3Rn334GUOKaV/7571515e89d9e3b02893855bbdb28dbb/l23.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SV Werder Bremen": {
    "name": "SV Werder Bremen",
    "shortName": "SVW",
    "crestUrl": "https://drop-assets.ea.com/images/5UE88g3Vfeo6kFu8lh1s26/cfc99dce8f7c7dc22a8a39920383cf3d/l38.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Dinamo Zagreb": {
    "name": "Dinamo Zagreb",
    "shortName": "DIN",
    "crestUrl": "https://drop-assets.ea.com/images/2xEcSelhmWxCdUWZosWED0/a0ddc6b9cc62ea75de64dc65762a827d/l211.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Stade Rennais FC": {
    "name": "Stade Rennais FC",
    "shortName": "STA",
    "crestUrl": "https://drop-assets.ea.com/images/7CHlTnryGZyOatI2WOFXiP/def56f5b08c456e671d09d3a47cc327b/l74.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "OGC Nice": {
    "name": "OGC Nice",
    "shortName": "OGC",
    "crestUrl": "https://drop-assets.ea.com/images/zByYanPvcCULBfC8OITvN/a262863aa77bfb1551a403f5f9b49f28/l72.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Girona FC": {
    "name": "Girona FC",
    "shortName": "GIR",
    "crestUrl": "https://drop-assets.ea.com/images/40lM20ITshJSKsZtWMGQ8m/3f11cea65b14635cc29654b6ba13c0b6/l110062.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Brentford": {
    "name": "Brentford",
    "shortName": "BRE",
    "crestUrl": "https://drop-assets.ea.com/images/3UCvZhjBB0odWNL0OPusuK/1de0f5b97a2e137201670df2cf09e1a5/l1925.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Union Berlin": {
    "name": "Union Berlin",
    "shortName": "UNI",
    "crestUrl": "https://drop-assets.ea.com/images/32dPG6jDXuIAOhWKeTYmeG/8d2df657c666abfbf84baaa732140a2a/l1831.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "VfL Wolfsburg": {
    "name": "VfL Wolfsburg",
    "shortName": "VFL",
    "crestUrl": "https://drop-assets.ea.com/images/5MdhycjojtZLf2WJwmlclb/efd91ff8cf935f09467aba75b1ea94ae/175.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "AFC Bournemouth": {
    "name": "AFC Bournemouth",
    "shortName": "AFC",
    "crestUrl": "https://drop-assets.ea.com/images/5Z6J6MhqjuJVwE7SVnfr5E/6075ff3239d67bdf8258a067ed93ccdb/l1943.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "LOSC Lille": {
    "name": "LOSC Lille",
    "shortName": "LOS",
    "crestUrl": "https://drop-assets.ea.com/images/tfbRaZiFuJ9jTer1qcf0Z/95171efd06d2494735c0e8a7c5aa9df2/l65.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Olympiacos FC": {
    "name": "Olympiacos FC",
    "shortName": "OLY",
    "crestUrl": "https://drop-assets.ea.com/images/2hyiQlv23Ipa7IOEtN7qAv/39a4514bd5a02d0d6db09d8eb2564c8f/l280.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Club Brugge": {
    "name": "Club Brugge",
    "shortName": "CLU",
    "crestUrl": "https://drop-assets.ea.com/images/7nHwlhyC2uPcLbb3LoBS82/08409177bc75126cfd7a9005fe3faa00/l231.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Khaleej": {
    "name": "Al Khaleej",
    "shortName": "ALK",
    "crestUrl": "https://drop-assets.ea.com/images/1RyALtBA51dh9V9jhV3XbV/a288ba6d75056f219d2b64d45b5054a7/l112883.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Whitecaps FC": {
    "name": "Whitecaps FC",
    "shortName": "WHI",
    "crestUrl": "https://drop-assets.ea.com/images/4B78Zk7BiGtY0lEDTDanGT/ba8604b69a6cab6fd0c668aefebc800c/l101112.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "LA Galaxy": {
    "name": "LA Galaxy",
    "shortName": "LAG",
    "crestUrl": "https://drop-assets.ea.com/images/eGVllmGrNtxd7wDWFgngP/a1d4ff6c7bbfaaefe0b5ab8c641af314/l697.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Burnley": {
    "name": "Burnley",
    "shortName": "BUR",
    "crestUrl": "https://drop-assets.ea.com/images/4GPA2P66fnKFCcli2PeCzd/38bafadedf31b53047d8a3e5bf2b7fac/1796.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Fayha": {
    "name": "Al Fayha",
    "shortName": "ALF",
    "crestUrl": "https://drop-assets.ea.com/images/3u5Hyla3Uqp1SDvPyS2X5x/78a5bea18628d97e18761d19113d5cec/l113057.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Celtic": {
    "name": "Celtic",
    "shortName": "CEL",
    "crestUrl": "https://drop-assets.ea.com/images/16GwjVn0vBxAdBx5F4uW0q/6a96b7c86f98010e0b9cd943dc48d4ca/l78.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "FC Cincinnati": {
    "name": "FC Cincinnati",
    "shortName": "FCC",
    "crestUrl": "https://drop-assets.ea.com/images/6LPKd3WwcBZ8LDcUuykbnj/ff5428082b780a98ebcb981a8891c58e/l113149.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Ain FC": {
    "name": "Al Ain FC",
    "shortName": "ALA",
    "crestUrl": "https://drop-assets.ea.com/images/7N0bj9ejtui6dQADUbJ4qT/60355b19aff7a02c72d8494e24de49f9/l111701.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "RCD Espanyol": {
    "name": "RCD Espanyol",
    "shortName": "RCD",
    "crestUrl": "https://drop-assets.ea.com/images/5NYvCpO1y0HynMKlJEcgRy/87d88f05181ecc55ecb3c86a6ce505d0/l452.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Hajduk Split": {
    "name": "Hajduk Split",
    "shortName": "HAJ",
    "crestUrl": "https://drop-assets.ea.com/images/1bDWS6ltUYonMzwG7kzCXP/d426bbccb973c5e62dcd62397cd4211e/l263.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Estudiantes": {
    "name": "Estudiantes",
    "shortName": "EST",
    "crestUrl": "https://drop-assets.ea.com/images/4YAQMFITOGB7FMvl3pAP52/0b2344540d9573f06dea8d5ed3af4bff/l101083.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Belgrano": {
    "name": "Belgrano",
    "shortName": "BEL",
    "crestUrl": "https://drop-assets.ea.com/images/6DO3TSy0AxrUyUGCPtjhbh/2365c6c79492f4d14c64c8470a2f6314/l111022.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Neom": {
    "name": "Neom",
    "shortName": "NEO",
    "crestUrl": "https://drop-assets.ea.com/images/19YBZNEm7MFPHXWpagPovP/4b539edbae2665b79907325436f2515d/l131798.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Nashville SC": {
    "name": "Nashville SC",
    "shortName": "NAS",
    "crestUrl": "https://drop-assets.ea.com/images/4FvmPxTXK6or9m3GMc0HxL/1e3e8d34f2cc18c60f7564781ff93279/l114162.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Wolves": {
    "name": "Wolves",
    "shortName": "WOL",
    "crestUrl": "https://drop-assets.ea.com/images/1q03RljtIaCoLLJLf7pMHZ/3bdb90117f4cbefa94f504140b4d591f/110.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "New England": {
    "name": "New England",
    "shortName": "NEW",
    "crestUrl": "https://drop-assets.ea.com/images/48ngeALXrPB00VU1uedurz/7841d93996c63753d1244626bbc2a3aa/l691.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Red Bulls": {
    "name": "Red Bulls",
    "shortName": "RED",
    "crestUrl": "https://drop-assets.ea.com/images/5f7uIjuRx6ua3nQqfm7qZr/8e8274e586ad7e6e0df6dd7e3f085e72/l689.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Nacional": {
    "name": "Nacional",
    "shortName": "NAC",
    "crestUrl": "https://drop-assets.ea.com/images/65KCz9xgBUSeStJX6pg13u/7dae389e9e96ae71862181d2f460ee1c/l111325.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "River Plate": {
    "name": "River Plate",
    "shortName": "RIV",
    "crestUrl": "https://drop-assets.ea.com/images/3a9cbBltvLpgMO1eByYVRq/bc311aba63f687dc0480c592dfeca1b4/l1876.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Slavia Praha": {
    "name": "Slavia Praha",
    "shortName": "SLA",
    "crestUrl": "https://drop-assets.ea.com/images/50ZlXnzmauE6zv0Hn5WifN/8d941df874a7753f22f33585999fa0ce/l266.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Ettifaq": {
    "name": "Al Ettifaq",
    "shortName": "ALE",
    "crestUrl": "https://drop-assets.ea.com/images/4iiu5yKgXLP6VztXNaebb1/19909c746281492a1191662354871832/l112096.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Dynamo Kyiv": {
    "name": "Dynamo Kyiv",
    "shortName": "DYN",
    "crestUrl": "https://drop-assets.ea.com/images/Vn6kgtvJTVHRxr7VKv1uQ/524fcf57ad88faa97991b86fbb4ecbea/l101047.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Lanús": {
    "name": "Lanús",
    "shortName": "LAN",
    "crestUrl": "https://drop-assets.ea.com/images/3YdIDtCdoAVx6qHfneuLay/c0dc2285e2422882233c8137a4f40606/l110395.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Boca Juniors": {
    "name": "Boca Juniors",
    "shortName": "BOC",
    "crestUrl": "https://drop-assets.ea.com/images/4v42cau4ZlAgfPnWHaQSKn/a9fa2af475b4b779ed13870c7f1ec66b/l1877.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Monza": {
    "name": "Monza",
    "shortName": "MON",
    "crestUrl": "https://drop-assets.ea.com/images/i4kAVgvlPEdNXfKUbBH18/6967acc661282aa7b02bd26587850890/111811.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Cremonese": {
    "name": "Cremonese",
    "shortName": "CRE",
    "crestUrl": "https://drop-assets.ea.com/images/1aj8ecKCYqDAk0MmAHopf5/dfd743048954b8dd87a0d2c084034726/111434.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "KRC Genk": {
    "name": "KRC Genk",
    "shortName": "KRC",
    "crestUrl": "https://drop-assets.ea.com/images/2064Z9wPzJbjkzW3n9b4RQ/ef883d28dde3104b3bea959320b4597a/l673.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "PAOK FC": {
    "name": "PAOK FC",
    "shortName": "PAO",
    "crestUrl": "https://drop-assets.ea.com/images/5goZMQS107pyc49zxrozAC/509a07a4d44e6315d1e5f6d556485f05/l393.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Independiente": {
    "name": "Independiente",
    "shortName": "IND",
    "crestUrl": "https://drop-assets.ea.com/images/1jWKtSnzOJLCUGQjgSw9B6/1c59266ca28d3abb505fb74ca58f12df/l110093.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Riyadh": {
    "name": "Al Riyadh",
    "shortName": "ALR",
    "crestUrl": "https://drop-assets.ea.com/images/1L9oQXove9EYtLUufOd5s2/6136b6d3c0a27fd6e686305be57baae7/l113037.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "R. Union St.-G.": {
    "name": "R. Union St.-G.",
    "shortName": "RUN",
    "crestUrl": "https://drop-assets.ea.com/images/6qEBd0g4qIBH3X6KtaTayV/e7405958edc583e79f63c0e71e560c77/l2014.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Toulouse FC": {
    "name": "Toulouse FC",
    "shortName": "TOU",
    "crestUrl": "https://drop-assets.ea.com/images/5EcfjMCX8afaXxC2kefK7V/41323bd3f20c2b1932bf3e939ddde465/l1809.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Trabzonspor": {
    "name": "Trabzonspor",
    "shortName": "TRA",
    "crestUrl": "https://drop-assets.ea.com/images/3AF1UCNvLwZs5kapbWuCk9/e1cebee09f0953e5653311d5a29365ee/l436.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "FC Basel 1893": {
    "name": "FC Basel 1893",
    "shortName": "FCB",
    "crestUrl": "https://drop-assets.ea.com/images/3Pch82RlxKrcAbcxJRaXPd/5960afa4e37bb3f71de4ba619cebeaee/l896.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Peñarol": {
    "name": "Peñarol",
    "shortName": "PEA",
    "crestUrl": "https://drop-assets.ea.com/images/rFTGUz1AtlFaYuMP9wQBA/74cde1b0418120bb18cfe36858a513cc/l101110.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Panathinaikos": {
    "name": "Panathinaikos",
    "shortName": "PAN",
    "crestUrl": "https://drop-assets.ea.com/images/zBYvcvWRAiK0eUY0XmU05/eebc4858ed03bb676b80ce8b9cef6919/l1884.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Taawoun": {
    "name": "Al Taawoun",
    "shortName": "ALT",
    "crestUrl": "https://drop-assets.ea.com/images/7p6TA5ewyxs1qzy8ym2ydy/15c716ca66c2ffcbed401be345ff6f8e/l112393.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Udinese": {
    "name": "Udinese",
    "shortName": "UDI",
    "crestUrl": "https://drop-assets.ea.com/images/eksZxUrkppoFO3BHpIKxc/ce0190c8a5e09464b8019123eb42a39d/l55.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Hellas Verona": {
    "name": "Hellas Verona",
    "shortName": "HEL",
    "crestUrl": "https://drop-assets.ea.com/images/3RhrLhk1upbdThmh856bTj/028eb47e33c9f1bbc3f6fd325e7cbfc8/206.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "San Diego FC": {
    "name": "San Diego FC",
    "shortName": "SAN",
    "crestUrl": "https://drop-assets.ea.com/images/3VVZhRHVje6glEOzkZ19Q5/9eb88fb073b6778321bbced6e22b58d9/l131439.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "SJ Earthquakes": {
    "name": "SJ Earthquakes",
    "shortName": "SJE",
    "crestUrl": "https://drop-assets.ea.com/images/24K6PFhSK3sFDydoFSN794/48139889372bb3d6db2fd41a924c5431/l111928.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Sevilla FC": {
    "name": "Sevilla FC",
    "shortName": "SEV",
    "crestUrl": "https://drop-assets.ea.com/images/1xocxSBJ3RrgP3Jponcw9H/b5b340790217ad2685083e1765b24273/l481.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Ferencvárosi TC": {
    "name": "Ferencvárosi TC",
    "shortName": "FER",
    "crestUrl": "https://drop-assets.ea.com/images/7iVvbVFFpSoNI3csHutnMv/2d26c636be8aaaffe2a945ab1f2bfb3c/l1874.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Hamburger SV": {
    "name": "Hamburger SV",
    "shortName": "HAM",
    "crestUrl": "https://drop-assets.ea.com/images/Vwj9mu65nCqScjLevwVoY/37cf47cedf66f85ed8078fe491b122a7/l28.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Sparta Praha": {
    "name": "Sparta Praha",
    "shortName": "SPA",
    "crestUrl": "https://drop-assets.ea.com/images/WsjKkMgEXh4mceoAQzFIi/d0b9c0ac886f0f3f3f91ca6ebda21577/l267.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Racing Club": {
    "name": "Racing Club",
    "shortName": "RAC",
    "crestUrl": "https://drop-assets.ea.com/images/A8RKWVxKQsKjBbty5kzt6/a21fa30821daf7c6a65546e58558c496/l101085.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Strasbourg": {
    "name": "Strasbourg",
    "shortName": "STR",
    "crestUrl": "https://drop-assets.ea.com/images/5ujpJkozlZbo3FNV0Fi84H/d39ffa173bd150d5f10bcfe3392abe54/l76.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Atlanta United": {
    "name": "Atlanta United",
    "shortName": "ATL",
    "crestUrl": "https://drop-assets.ea.com/images/7eEpDrKitxMaqo5dk0Kude/7c71b8ba391e5c5cd891bdc1fc5f1111/l112885.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "D. Alavés": {
    "name": "D. Alavés",
    "shortName": "DAL",
    "crestUrl": "https://drop-assets.ea.com/images/5VGQ2vTkXWSoS9l8HL69Yi/2bc91cc1635bacb9cd0418a4f94400fa/l463.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Rangers": {
    "name": "Rangers",
    "shortName": "RAN",
    "crestUrl": "https://drop-assets.ea.com/images/5lOjqHjEdrBuaj323x9jDf/b5504a0894594d6c3dfa97cca700e572/l86.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "AEK Athens": {
    "name": "AEK Athens",
    "shortName": "AEK",
    "crestUrl": "https://drop-assets.ea.com/images/4qTLnCKd5EuaAqSHT6TqiQ/e696de56fdde60bfd4d62ec6b59682ee/l278.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Sheffield Utd": {
    "name": "Sheffield Utd",
    "shortName": "SHE",
    "crestUrl": "https://drop-assets.ea.com/images/3QhayzKjMV2yOdihydTnVZ/c272cce245fae380f220f4c9cca689f1/l1794.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Genoa": {
    "name": "Genoa",
    "shortName": "GEN",
    "crestUrl": "https://drop-assets.ea.com/images/K5vcQ5KjT64Rr1dZZu3RG/0955cabcb0645ef5649ed69904e4b502/l110556.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Al Fateh": {
    "name": "Al Fateh",
    "shortName": "ALF",
    "crestUrl": "https://drop-assets.ea.com/images/6v7yU4RrTQPgruLFIKjFOR/9757e8a4070b872b3be68038edfccf95/l112390.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "1. FC Köln": {
    "name": "1. FC Köln",
    "shortName": "FCK",
    "crestUrl": "https://drop-assets.ea.com/images/1YRZmYboKO3TLN8LdJdFjk/6015406736cb01c604c6e911040ed238/l31.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "FK Bodø/Glimt": {
    "name": "FK Bodø/Glimt",
    "shortName": "FKB",
    "crestUrl": "https://drop-assets.ea.com/images/6tn2m1mm20cckFsvUL8AEG/a2cc4cd5cb3203af9b077dc705109903/l918.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "FC Augsburg": {
    "name": "FC Augsburg",
    "shortName": "FCA",
    "crestUrl": "https://drop-assets.ea.com/images/1LMXVBp9QlIruHH6OejXOw/97f61074046861f13beaf6216a07edb5/l100409.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Shakhtar Donetsk": {
    "name": "Shakhtar Donetsk",
    "shortName": "SHA",
    "crestUrl": "https://drop-assets.ea.com/images/2boV5vckSWy81CHbJ0bNdO/bc02139a7497860e5af88f7a13c32523/l101059.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "RSC Anderlecht": {
    "name": "RSC Anderlecht",
    "shortName": "RSC",
    "crestUrl": "https://drop-assets.ea.com/images/6fPz45ZIDQWOd7Lqv0GuZF/045eacfd4e3fade98ceca05cb12b6c60/l229.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Colo-Colo": {
    "name": "Colo-Colo",
    "shortName": "COL",
    "crestUrl": "https://drop-assets.ea.com/images/5yEnhrUveEFXMJgrKLLwzN/62537e09446eabca962bdb9509422f36/l110980.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "F.C. København": {
    "name": "F.C. København",
    "shortName": "FCK",
    "crestUrl": "https://drop-assets.ea.com/images/6r6we9mj39z5Irzr0aRxQU/4066cee956fb6aca5b2021644a14f82f/l819.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Newell's": {
    "name": "Newell's",
    "shortName": "NEW",
    "crestUrl": "https://drop-assets.ea.com/images/4myHS85tfHbXceOM9VjH8v/042425c3bd14407977ea4c0039327c56/l110396.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Royal Antwerp FC": {
    "name": "Royal Antwerp FC",
    "shortName": "ROY",
    "crestUrl": "https://drop-assets.ea.com/images/1wT4b98gccpzVFHeTx5Uqk/c32f89ede86de13b615f5ab7f9984964/l230.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "RC Lens": {
    "name": "RC Lens",
    "shortName": "RCL",
    "crestUrl": "https://drop-assets.ea.com/images/3HrZR8go9EdkyD4jpbWPic/0fcbfb41b4d42943916892d763af8d55/l64.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Charlotte FC": {
    "name": "Charlotte FC",
    "shortName": "CHA",
    "crestUrl": "https://drop-assets.ea.com/images/2XdxNo0fpuLxoylkpYWVlt/aeb3ddd9bb97accae5777262a7822e27/l114640.png",
    "primaryColor": "#133865",
    "secondaryColor": "#FFDC2B",
    "country": "INT"
  },
  "Parma": {
    "name": "Parma",
    "shortName": "PAR",
    "crestUrl": "https://images.fotmob.com/image_resources/logo/teamlogo/10167.png",
    "primaryColor": "#003399",
    "secondaryColor": "#FFDC2B",
    "country": "ITA"
  },
  "San Lorenzo": {
    "name": "San Lorenzo",
    "shortName": "SLO",
    "crestUrl": "https://images.fotmob.com/image_resources/logo/teamlogo/10083.png",
    "primaryColor": "#003399",
    "secondaryColor": "#E30613",
    "country": "ARG"
  }
};

export const ALL_CLUB_CRESTS_LIST: ClubVisual[] = Object.values(CLUB_CRESTS);

export const GAME_COVERS = {
  ea_fc: {
    title: "EA SPORTS FC 26",
    coverUrl: "https://api.arena17.com/uploads/jogos/39.jpg",
    badgeColor: "#ffdc2b",
  },
  efootball: {
    title: "eFootball 2026",
    coverUrl: "https://api.arena17.com/uploads/jogos/38.jpg",
    badgeColor: "#38bdf8",
  },
};

export function getClubVisual(clubName?: string | null): ClubVisual {
  if (!clubName) {
    return {
      name: "A Definir",
      shortName: "TBD",
      crestUrl: "",
      primaryColor: "#133865",
      secondaryColor: "#FFDC2B",
      country: "INT",
    };
  }

  if (CLUB_CRESTS[clubName]) {
    return CLUB_CRESTS[clubName];
  }

  const found = Object.values(CLUB_CRESTS).find(
    (c) =>
      clubName.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(clubName.toLowerCase())
  );
  if (found) return found;

  return {
    name: clubName,
    shortName: clubName.slice(0, 3).toUpperCase(),
    crestUrl: "",
    primaryColor: "#133865",
    secondaryColor: "#FFDC2B",
    country: "CLB",
  };
}

export function ClubCrest({
  clubName,
  size = "md",
}: {
  clubName?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const visual = getClubVisual(clubName);
  const dims =
    size === "sm"
      ? "w-6 h-6 text-[9px]"
      : size === "lg"
      ? "w-10 h-10 text-xs"
      : "w-8 h-8 text-[10px]";

  if (visual.crestUrl) {
    return (
      <span
        title={visual.name}
        className={`${dims} rounded-[4px] bg-[#090c12] border border-[#222c40] p-1 inline-flex items-center justify-center shrink-0 overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.crestUrl}
          alt={visual.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </span>
    );
  }

  return (
    <span
      title={visual.name}
      style={{
        borderColor: visual.secondaryColor,
        backgroundColor: visual.primaryColor,
      }}
      className={`${dims} rounded-[4px] border font-bold text-[#f4f6fb] inline-flex items-center justify-center shrink-0 uppercase tracking-tighter`}
    >
      {visual.shortName}
    </span>
  );
}
