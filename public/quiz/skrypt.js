let uzytkownikOpowiedzialPoprawnieNa = 0;

let uzyteIndeksyPytan = [];
let ObiektJSONzPytaniami;
let iloscPytanwPlikuJSONDanejwKategorii;
let numerWybranejKategorii;

let POPRAWNAODPOWIEDZ;


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

    blockZPytaniem.style.display = "flex";
    przycikiQuizuGorne.style.display = "block";
    przycikiQuizuDolne.style.display = "block";
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
    let url = "/resources/BazaDanychPytan.json";
    let response = await fetch(url);
    ObiektJSONzPytaniami = await response.json(); 
    iloscPytanwPlikuJSONDanejwKategorii = ObiektJSONzPytaniami.kategorie[numerKategorii].pytania.length;
    numerWybranejKategorii = numerKategorii;
}

function wyswietlSlowka()
{

}

function zaladujSlowka(slowo)
{
    document.getElementById("Odliczanie").style.display = "block";
        document.getElementById("Odliczanie").innerHTML = "<br><br>" + slowo;
        setTimeout(() => {
            
            document.getElementById("Odliczanie").style.display = "none";
            wyswietlSlowka();
            //funkcje po załadowaniu quizu
        }, 3500);
      
}

function zaladujPytanie()
{   
    document.getElementById("pkt").innerHTML = uzytkownikOpowiedzialPoprawnieNa;

    if(ObiektJSONzPytaniami['kategorie'][numerWybranejKategorii]['typ'] == "zwykly")
    {
            // generuje pytanie, rozne od poprzednich


    let indeksPytania;
        do
        {        

            indeksPytania = Math.floor(Math.random() * (iloscPytanwPlikuJSONDanejwKategorii + 1));

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

function animowanieZmianyPytania( czyPoprawna )
{
    var przycikiQuizuGorne = document.getElementById("przyciskQuizu1");
    var przycikiQuizuDolne = document.getElementById("przyciskQuizu2");
    var blockZPytaniem = document.getElementById("pytanie");

    blockZPytaniem.style.display = "none";
    przycikiQuizuGorne.style.display = "none";
    przycikiQuizuDolne.style.display = "none";

    document.getElementById("Odliczanie").style.display = "block";
    if(czyPoprawna)
    {
        document.getElementById("Odliczanie").innerHTML = "<br><br>Poprawna odpowiedz!";
    }
    else{
        document.getElementById("Odliczanie").innerHTML = "<br><br>Bledna odpowiedz!";
    }

    setTimeout(() => {
            
        blockZPytaniem.style.display = "block";
        przycikiQuizuGorne.style.display = "block";
        przycikiQuizuDolne.style.display = "block";

        document.getElementById("Odliczanie").style.display = "none";
        
    }, 1000);
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
    zaladujSlowka("Slowka");
    //tutaj funkcje ładowania pytań(ten segment będzie się wykonywać w tle)
}

function klikniecieOdpowiedziZwyklePytania( ktoWywoluje )
{
    if(ktoWywoluje == POPRAWNAODPOWIEDZ)
    {
        uzytkownikOpowiedzialPoprawnieNa++;
        animowanieZmianyPytania(1);
        zaladujPytanie();
    }
    else
    {
        animowanieZmianyPytania(0);
        zaladujPytanie();
    }
}

