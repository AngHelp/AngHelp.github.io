let uzytkownikOpowiedzialPoprawnieNa = 0;
let uzyteIndeksyPytan = [];
let indeksyOdpNaKtoreOdpowiedzial = [];
let ObiektJSONzPytaniami;
let iloscPytanwPlikuJSONDanejwKategorii;
let numerWybranejKategorii;
let POPRAWNAODPOWIEDZ;

const MAXILOSCPYTAN = 5;
let aktualnieOdpowiedzialNa = 1;


function usunMenuGlowne()
{
var przyciskiKategorii = document.getElementById("przyciskKategorii");
var blockZMenuGlownym = document.getElementById("menuGlowne");



   przyciskiKategorii.style.display = 'none';
   blockZMenuGlownym.style.display = "none";


}
function wyswietlQuiz()
{
    var przycikiQuizuGorne = document.getElementById("przyciskQuizu1");
    var przycikiQuizuDolne = document.getElementById("przyciskQuizu2");
    var blockZPytaniem = document.getElementById("pytanie");
    let punkty = document.getElementById("punktacja");
    let przyciskpowrotu = document.getElementById("przyciskiDodatkowe");
    
    
    przyciskpowrotu.style.display = "block";
    blockZPytaniem.style.display = "flex";
    przycikiQuizuGorne.style.display = "flex";
    przycikiQuizuDolne.style.display = "flex";
    punkty.style.display = "flex";
}

function zaladujMenuQuizu(slowo)
{
    document.getElementById("Odliczanie").style.display = "block";
        document.getElementById("Odliczanie").innerHTML = "<br><br>" + slowo;
        setTimeout(() => {
            document.getElementById("Odliczanie").style.display = "none";
            wyswietlQuiz();
            zaladujPytanie();
                //funkcje po załadowaniu quizu
        }, 3500);
      
}

async function wczytajPytaniaDoQuizu( numerKategorii )
{
    let url = "./resources/BazaDanychPytan.json";
    let response = await fetch(url);
    ObiektJSONzPytaniami = await response.json(); 
    iloscPytanwPlikuJSONDanejwKategorii = ObiektJSONzPytaniami.kategorie[numerKategorii].pytania.length;
    numerWybranejKategorii = numerKategorii;
}

function pomocLadowaniaBlednychSlowek(indekss, tabIndeksow = [])
{
    for(let i = 0; i < tabIndeksow.length; i++)
    {
        if(tabIndeksow[i] == indekss)
            return true;
    }
    return false;
}

function zaladujPytanie()
{   
    document.getElementById("pkt").innerHTML = uzytkownikOpowiedzialPoprawnieNa;
    document.getElementById("ktorePytanie").innerHTML = aktualnieOdpowiedzialNa + "/" + MAXILOSCPYTAN;

    if(aktualnieOdpowiedzialNa <= MAXILOSCPYTAN)
    {
        if(ObiektJSONzPytaniami['kategorie'][numerWybranejKategorii]['typ'] == "zwykly")
        {
            // generuje pytanie, rozne od poprzednich
            aktualnieOdpowiedzialNa++;
            let indeksPytania;
            do
            {        
                indeksPytania = Math.floor(Math.random() * (iloscPytanwPlikuJSONDanejwKategorii));

            }while(pomocLadowaniaPytan( indeksPytania ));
            uzyteIndeksyPytan.push(indeksPytania);


            let skrotJSON = ObiektJSONzPytaniami.kategorie[numerWybranejKategorii];
            document.getElementById("pytanie").innerHTML = skrotJSON.pytania[indeksPytania].tresc;

            POPRAWNAODPOWIEDZ = skrotJSON.pytania[indeksPytania].odpowiedzi[4];

            document.getElementById("odpA").innerHTML = skrotJSON.pytania[indeksPytania].odpowiedzi[0];
            document.getElementById("odpB").innerHTML = skrotJSON.pytania[indeksPytania].odpowiedzi[1]; 
            document.getElementById("odpC").innerHTML = skrotJSON.pytania[indeksPytania].odpowiedzi[2];
            document.getElementById("odpD").innerHTML = skrotJSON.pytania[indeksPytania].odpowiedzi[3];

            // generowanie
        }
        else if(ObiektJSONzPytaniami['kategorie'][numerWybranejKategorii]['typ'] == "slowa")
        {
            // generuje pytanie, rozne od poprzednich
            aktualnieOdpowiedzialNa++;
            let skrotJSON = ObiektJSONzPytaniami.kategorie[numerWybranejKategorii];
            let pytanie = Object.entries(skrotJSON.pytania);
            let indeksPytania;
            do
            {        
                indeksPytania = Math.floor(Math.random() * pytanie.length);

            }while(pomocLadowaniaPytan( indeksPytania ));
            uzyteIndeksyPytan.push(indeksPytania);
       
            let kierunek = Math.random() < 0.5 ? 1 : 0;


            let poprawna = pytanie[indeksPytania][kierunek];
            let odpALL = [];

            odpALL.push("@" + poprawna);

            let terazUzyteIndeksy = [];
            for(let i = 0; i < 3; i++)
            {
                let indexNiePODP;     
                do
                {        
                    indexNiePODP = Math.floor(Math.random() * pytanie.length);
    
                }while(pomocLadowaniaPytan( indexNiePODP ) || pomocLadowaniaBlednychSlowek(indexNiePODP, terazUzyteIndeksy)); 
                odpALL.push(pytanie[indexNiePODP][kierunek]);
                terazUzyteIndeksy.push(indexNiePODP);
            }
            
            permutacja(odpALL);


            for(let i = 0; i < 4; i++)
            {
                if(odpALL[i][0] === "@")
                {
                    odpALL[i] = odpALL[i].slice(1);
                    POPRAWNAODPOWIEDZ = i;
                    break;
                }   
            }

            document.getElementById("pytanie").innerHTML = pytanie[indeksPytania][Math.abs(kierunek - 1)];

            document.getElementById("odpA").innerHTML = odpALL[0];
            document.getElementById("odpB").innerHTML = odpALL[1]; 
            document.getElementById("odpC").innerHTML = odpALL[2]; 
            document.getElementById("odpD").innerHTML = odpALL[3]; 

            // todo
        }
    }
}

function pomocLadowaniaPytan( indekss )
{
    for(let i = 0; i < uzyteIndeksyPytan.length; i++)
    {
        if(uzyteIndeksyPytan[i] == indekss)
            return true;
    }
    return false;
}

function zaladujEkranKoncowy()
{
    let napisKoncowyODP = document.getElementById("poprawneODP");
    let napisyKoncowe = document.getElementById("napisyKoncowe");
    let przyciskiKoncowe = document.getElementById("przyciskEkranuKoncowego");
    var przycikiQuizuGorne = document.getElementById("przyciskQuizu1");
    var przycikiQuizuDolne = document.getElementById("przyciskQuizu2");
    var blockZPytaniem = document.getElementById("pytanie");

    blockZPytaniem.style.display = "none";
    przycikiQuizuGorne.style.display = "none";
    przycikiQuizuDolne.style.display = "none";

    napisKoncowyODP.innerHTML += uzytkownikOpowiedzialPoprawnieNa + "/" + MAXILOSCPYTAN + "!";

    document.getElementById("ktorePytanie").innerHTML = MAXILOSCPYTAN.toString() + "/" + MAXILOSCPYTAN.toString();
    napisKoncowyODP.style.display = "block";
    napisyKoncowe.style.display = "block";
    przyciskiKoncowe.style.display = "block";

}

function animowanieZmianyPytania( tekst )
{
    var przycikiQuizuGorne = document.getElementById("przyciskQuizu1");
    var przycikiQuizuDolne = document.getElementById("przyciskQuizu2");
    var blockZPytaniem = document.getElementById("pytanie");
    let przyciskpowrotu = document.getElementById("przyciskiDodatkowe");
    let punktacjaV = document.getElementById("punktacja");
    
    punktacjaV.style.display = "none";
    przyciskpowrotu.style.display = "none";
    blockZPytaniem.style.display = "none";
    przycikiQuizuGorne.style.display = "none";
    przycikiQuizuDolne.style.display = "none";
    
    document.getElementById("odpA").style.opacity = 1.0;
    document.getElementById("odpA").style.cursor = "pointer";
    document.getElementById("odpA").disabled = false;

    document.getElementById("odpB").style.opacity = 1.0;
    document.getElementById("odpB").style.cursor = "pointer";
    document.getElementById("odpB").disabled = false;

    document.getElementById("odpC").style.opacity = 1.0;
    document.getElementById("odpC").style.cursor = "pointer";
    document.getElementById("odpC").disabled = false;

    document.getElementById("odpD").style.opacity = 1.0;
    document.getElementById("odpD").style.cursor = "pointer";
    document.getElementById("odpD").disabled = false;


    document.getElementById("Odliczanie").style.display = "block";
    document.getElementById("Odliczanie").innerHTML = "<br>" + tekst;

    if(aktualnieOdpowiedzialNa <= MAXILOSCPYTAN || tekst == "Użyłeś koła ratunkowego!")
    {
        setTimeout(() => {
            
            blockZPytaniem.style.display = "block";
            przycikiQuizuGorne.style.display = "block";
            przycikiQuizuDolne.style.display = "block";
            punktacjaV.style.display = "flex";

            document.getElementById("Odliczanie").style.display = "none";
            przyciskpowrotu.style.display = "block";
        
        }, 1000);
    }
    else{
        setTimeout(() => {

            punktacjaV.style.display = "flex";
            document.getElementById("Odliczanie").style.display = "none";
            zaladujEkranKoncowy();
        }, 1000);
    }
}

function KlikniecieKategoriiA()
{
    usunMenuGlowne();
    zaladujMenuQuizu("Reported Speech");
    wczytajPytaniaDoQuizu(0);
    zaladujPytanie();
}
function KlikniecieKategoriiB()
{
    usunMenuGlowne();
    zaladujMenuQuizu("Tenses");
    wczytajPytaniaDoQuizu(1);
    zaladujPytanie();
}
function KlikniecieKategoriiC()
{
    usunMenuGlowne();
    zaladujMenuQuizu("Vocabulary");
    wczytajPytaniaDoQuizu(2);
}

function klikniecieOdpowiedziZwyklePytania( ktoWywoluje )
{
    if(ktoWywoluje == POPRAWNAODPOWIEDZ)
    {
        uzytkownikOpowiedzialPoprawnieNa++;
        animowanieZmianyPytania("Poprawna odpowiedź!");
        zaladujPytanie();
    }
    else
    {
        animowanieZmianyPytania("Błędna odpowiedź!");
        zaladujPytanie();
    }
    indeksyOdpNaKtoreOdpowiedzial.push(ktoWywoluje);
}

function uzycieKolaRatunkowego()
{
    animowanieZmianyPytania("Użyłeś koła ratunkowego!");

    let numerOdpowiedzi1;
    let numerOdpowiedzi2;
    do
    {
        numerOdpowiedzi1 = Math.floor(Math.random() * 4);

    }while(numerOdpowiedzi1 == POPRAWNAODPOWIEDZ);  // tak dlugo jak bedzie losowac wartosc numeruOdpowiedzi równą poprawnej

    do
    {
        numerOdpowiedzi2 = Math.floor(Math.random() * 4);

    }while(numerOdpowiedzi2 == POPRAWNAODPOWIEDZ || numerOdpowiedzi2 == numerOdpowiedzi1);  // tak dlugo jak bedzie losowac wartosc numeruOdpowiedzi równą poprawnej

    switch(numerOdpowiedzi1)
    {
        case 0:
            document.getElementById("odpA").style.opacity = 0.6;
            document.getElementById("odpA").style.cursor = "not-allowed";
            document.getElementById("odpA").disabled = true;

        break;

        case 1:
            document.getElementById("odpB").style.opacity = 0.6;
            document.getElementById("odpB").style.cursor = "not-allowed";
            document.getElementById("odpB").disabled = true;
        break;

        case 2:
            document.getElementById("odpC").style.opacity = 0.6;
            document.getElementById("odpC").style.cursor = "not-allowed";
            document.getElementById("odpC").disabled = true;
        break;

        case 3:
            document.getElementById("odpD").style.opacity = 0.6;
            document.getElementById("odpD").style.cursor = "not-allowed";
            document.getElementById("odpD").disabled = true;
        break;
    }

    switch(numerOdpowiedzi2)
    {
        case 0:
            document.getElementById("odpA").style.opacity = 0.6;
            document.getElementById("odpA").style.cursor = "not-allowed";
            document.getElementById("odpA").disabled = true;

        break;

        case 1:
            document.getElementById("odpB").style.opacity = 0.6;
            document.getElementById("odpB").style.cursor = "not-allowed";
            document.getElementById("odpB").disabled = true;
        break;

        case 2:
            document.getElementById("odpC").style.opacity = 0.6;
            document.getElementById("odpC").style.cursor = "not-allowed";
            document.getElementById("odpC").disabled = true;
        break;

        case 3:
            document.getElementById("odpD").style.opacity = 0.6;
            document.getElementById("odpD").style.cursor = "not-allowed";
            document.getElementById("odpD").disabled = true;
        break;
    }

    document.getElementById("przyciskKolaRatunkowego").style.opacity = 0.6;
    document.getElementById("przyciskKolaRatunkowego").style.cursor = "not-allowed";
    document.getElementById("przyciskKolaRatunkowego").disabled = true;
}

function zobaczPoprawneOdpowiedzi()
{
    if(numerWybranejKategorii < 2) zobaczPoprawneOdpowiedziPytania();
    else if(numerWybranejKategorii == 2) zobaczPoprawneOdpowiedziSlowka();
}

function zobaczPoprawneOdpowiedziSlowka()
{
    let przyciskPowrotu = document.getElementById("zobaczOdpowiedzi");
    let przyciskLadowaniaPoprawnych = document.getElementById("strGlowna");
    let listaOdpowiedzi = document.getElementById("listaOdpowiedzi");
    let punktacjaV = document.getElementById("punktacja");

    let przyciskiDodatkowe = document.getElementById("przyciskiDodatkowe");
    let przyciskKolRatunkowych = document.getElementById("przyciskKolaRatunkowego");

    punktacjaV.style.display = "none";
    przyciskPowrotu.style.display = "none";
    przyciskLadowaniaPoprawnych.style.display = "none";

    przyciskKolRatunkowych.style.display = "none"
    przyciskiDodatkowe.style.display = "block";
    przyciskiDodatkowe.style.paddingLeft = "10%";

    listaOdpowiedzi.style.display = "block";
    // GENERATOR ODPOWIEDZI
    let completelist= document.getElementById("thelist");

    let skrotJSON = ObiektJSONzPytaniami.kategorie[numerWybranejKategorii];  

    let pytanie = Object.entries(skrotJSON.pytania);
  
    for(let i = 0; i < uzyteIndeksyPytan.length; i++)
    {
        if(ObiektJSONzPytaniami['kategorie'][numerWybranejKategorii]['typ'] == "slowa")
        {
            let numerPytania = (i + 1).toString();
            console.log("elo")
            completelist.innerHTML += 
            "<li id=\"" + numerPytania + "slowa\">" + pytanie[uzyteIndeksyPytan[i]][0] + " - " + pytanie[uzyteIndeksyPytan[i]][1] + "</li>"; 
        }
    }
}

function zobaczPoprawneOdpowiedziPytania()
{

    
    let przyciskPowrotu = document.getElementById("zobaczOdpowiedzi");
    let przyciskLadowaniaPoprawnych = document.getElementById("strGlowna");
    let listaOdpowiedzi = document.getElementById("listaOdpowiedzi");
    let punktacjaV = document.getElementById("punktacja");

    let przyciskiDodatkowe = document.getElementById("przyciskiDodatkowe");
    let przyciskKolRatunkowych = document.getElementById("przyciskKolaRatunkowego");

    punktacjaV.style.display = "none";
    przyciskPowrotu.style.display = "none";
    przyciskLadowaniaPoprawnych.style.display = "none";

    przyciskKolRatunkowych.style.display = "none"
    przyciskiDodatkowe.style.display = "block";
    przyciskiDodatkowe.style.paddingLeft = "10%";

    listaOdpowiedzi.style.display = "block";
    // GENERATOR ODPOWIEDZI
    let completelist= document.getElementById("thelist");
    
    let skrotJSON = ObiektJSONzPytaniami.kategorie[numerWybranejKategorii];  
    for(let i = 0; i < uzyteIndeksyPytan.length; i++)
    {
        if(ObiektJSONzPytaniami['kategorie'][numerWybranejKategorii]['typ'] == "zwykly")
        {
            let numerPytania = (i + 1).toString();

            completelist.innerHTML += 
            "<li>"+ skrotJSON.pytania[uzyteIndeksyPytan[i]].tresc + 
            "<ul>" +  
                "<li id=\"" + numerPytania + "odp1\">" + skrotJSON.pytania[uzyteIndeksyPytan[i]].odpowiedzi[0] + "</li>" +
                "<li id=\"" + numerPytania + "odp2\">" + skrotJSON.pytania[uzyteIndeksyPytan[i]].odpowiedzi[1] + "</li>" +
                "<li id=\"" + numerPytania + "odp3\">" + skrotJSON.pytania[uzyteIndeksyPytan[i]].odpowiedzi[2] + "</li>" +
                "<li id=\"" + numerPytania + "odp4\">" + skrotJSON.pytania[uzyteIndeksyPytan[i]].odpowiedzi[3] + "</li>" +
            "</ul>"
      
            + "</li>"; 
        }
    }
    for(let i = 0; i < uzyteIndeksyPytan.length; i++)
    {
        let numerPytania = (i + 1).toString();

        let odp1 = document.getElementById(numerPytania + "odp1");
        let odp2 = document.getElementById(numerPytania + "odp2");
        let odp3 = document.getElementById(numerPytania + "odp3");
        let odp4 = document.getElementById(numerPytania + "odp4");
    
    
            switch(indeksyOdpNaKtoreOdpowiedzial[i])
            {
                case 0:
                    odp1.style.color = "#C21807"
                    break;
                case 1:
                    odp2.style.color = "#C21807"
                    break;
                case 2:
                    odp3.style.color = "#C21807"
                    break;
                case 3:
                    odp4.style.color = "#C21807"
                    break;
            }
            switch(skrotJSON.pytania[uzyteIndeksyPytan[i]].odpowiedzi[4])
            {
                case 0:
                    odp1.style.color = "#26580F"
                    break;
                case 1:
                    odp2.style.color = "#26580F"
                    break;
                case 2:
                    odp3.style.color = "#26580F"
                    break;
                case 3:
                    odp4.style.color = "#26580F"
                    break;
            }
        }
}

let permutacja = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        // Zamieniamy wybrany element z innym losowo wybranym
        let r = i + Math.floor(Math.random() * (arr.length - i));
        [arr[i], arr[r]] = [arr[r], arr[i]];
    }
    return arr;
}
