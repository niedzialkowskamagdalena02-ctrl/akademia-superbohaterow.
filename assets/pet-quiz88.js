const gradeTwo={
 polski:[
  ['W zdaniu „Ada podlewa kwiaty” wskaż czasownik.',['Ada','podlewa','kwiaty'],1],
  ['W którym wyrazie jest najwięcej sylab?',['pies','rower','parasolka'],2],
  ['Które dwa słowa są rzeczownikami?',['las i sowa','lata i woła','cichy i mały'],0],
  ['Olek poszedł do biblioteki i wypożyczył książkę o kosmosie. Skąd wziął książkę?',['Z księgarni','Z biblioteki','Ze szkoły'],1],
  ['Które zdanie zapisano poprawnie?',['marta ma psa.','Marta ma psa','Marta ma psa.'],2]
 ],
 matematyka:[
  ['Lena ma 24 naklejki i oddała 7. Ile ma teraz?',['17','19','31'],0],
  ['W trzech pudełkach jest po 5 kredek. Ile jest ich razem?',['8','10','15'],2],
  ['W autobusie było 16 osób. Na przystanku wsiadło 9. Ile osób jest w autobusie?',['23','25','27'],1],
  ['Która liczba jest o 8 mniejsza od 36?',['28','30','44'],0],
  ['Ile razem jest 2 złote, 5 złotych i 10 złotych?',['15 zł','17 zł','20 zł'],1]
 ],
 przyroda:[
  ['Dlaczego zimą część ptaków odlatuje z Polski?',['Trudniej im znaleźć pokarm','Chcą nauczyć się pływać','Za długo jest jasno'],0],
  ['Które zwierzę może oddychać pod wodą skrzelami?',['Żaba dorosła','Kaczka','Karp'],2],
  ['Na których częściach rośliny powstaje najwięcej pokarmu dzięki światłu?',['Na korzeniach','Na liściach','Na nasionach'],1],
  ['Co pojawi się na zimnej szybie, gdy na nią chuchniesz?',['Małe kropelki wody','Kryształki soli','Drobiny piasku'],0]
 ]
};
const englishPractice=[
 ['The cat is under the table. Where is the cat?',['Na stole','Pod stołem','Obok stołu'],1,'Posłuchaj zdania. Gdzie jest kot?'],
 ['Choose the word that completes “I drink ___”.',['water','chair','pencil'],0,'Wybierz słowo do zdania „Piję …”.'],
 ['“I have two dogs.” How many dogs?',['Jeden','Dwa','Trzy'],1,'Posłuchaj zdania. Ile jest psów?'],
 ['The apple is red. Which word is a colour?',['apple','is','red'],2,'Wskaż wyraz, który oznacza kolor.'],
 ['“Open the door, please.” What do you do?',['Zamykasz drzwi','Otwierasz okno','Otwierasz drzwi'],2,'Posłuchaj polecenia. Co masz zrobić?'],
 ['It is raining. What do you take?',['An umbrella','A pencil','A ball'],0,'Pada deszcz. Co ze sobą zabierasz?']
];

function shuffled(items,random){
 const list=[...items];
 for(let i=list.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [list[i],list[j]]=[list[j],list[i]];
 }
 return list;
}

export function petQuiz88(grade,preschool,bank,random=Math.random){
 if(grade==='P'){
  const questions=preschool.filter(({q})=>!/\d\s*[-−–]\s*\d|odejmi|odejmow|ile (?:ich )?zosta(?:ł|j)/i.test(q));
  return shuffled(questions.map(({q,a,ok})=>[q,a,ok]),random).slice(0,5);
 }
 if(Number(grade)<2)return shuffled(Object.values(bank).flat(),random).slice(0,5);
 const english=[...shuffled(bank.angielski,random).slice(0,1),...shuffled(englishPractice,random).slice(0,1)];
 const core=Object.values(gradeTwo).map(questions=>shuffled(questions,random)[0]);
 return shuffled([...core,...english],random);
}
