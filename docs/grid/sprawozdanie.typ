// Student w ramach pracy powinien opracować schemat konteneryzacji wybranej usługi i go omówić. 

// Przykładowe realizacje projektu mogą polegać na (nie ograniczając się do): opracowaniu i omówieniu usługi w architekturze mikrousług (z opisem stosowanych wzorców projektowych), przedstawienie wdrożenia platformy OpenShift (lub OKD), konteneryzacji aplikacji sieciowej z zastosowaniem templetów.

// Projekt powinien zawierać opis stosowanej technologii oraz omówienie przedstawionego rozwiązania. 
// W projekcie proszę przedstawić napotkane problemy i omówić ich rozwiązania.

// Student w ramach realizacji projektu powinien zastosować Kubernetes lub OpenShift do orkiestracji kontenerów.

// Wymagania techniczne:
// margines 3,5 cm po lewej stronie i 2,5 cm na górze, dole i po prawej stronie,
// czcionka: Times New Roman 12 pkt,
// Interlinia: 1.5,
// tekst powinien być wyjustowany do obu marginesów.
// W projekcie powinny znajdować się przypisy, cytowania i bibliografia. Proszę pamiętać o numerowaniu i podpisaniu wszystkich rysunków, listingów kodu, tabel (odpowiednio: Rys X., Listing X., Tabela X.) 

#set document(title: "Systemy Gridowe i Obliczenia w Chmurze")
#set page(paper: "a4", margin: (left: 3.5cm, top: 2.5cm, right: 2.5cm, bottom: 2.5cm))
#set text(font: "Times New Roman", size: 12pt, lang: "pl")
#set par(justify: true, leading: 6pt)

#stack(
  dir: ltr,
  image("assets/logo_pk.png", width: 8cm),
  align(right)[
    #v(1em)
    #text(size: 1.1em)[
      24 listopada 2025 \
      Grupa P3
    ]
  ]
)

#v(2em)

#align(center)[
  #text(size: 1.8em)[Konteneryzacja aplikacji finansowej Okane z wykorzystaniem Minikube, Kubernets oraz Podman] 
  
  #text(size: 1.2em)[Systemy Gridowe i Obliczenia w Chmurze]
]

#v(1fr) 

#align(center)[
  #text(size: 1.2em)[Kacper Kosmal, Marcin Klimek]
]

#pagebreak()