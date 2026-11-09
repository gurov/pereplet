// Картинки для README: по 30 обложек английских (docs/covers-en.webp) и русских (docs/covers-ru.webp) книг.
// Нужны Chrome (CHROME=…, по умолчанию google-chrome) и ImageMagick (magick). Обложки меняются — перезапустить.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { drawCover, STYLES } from '../src/index.ts';
import { hash } from '../src/core.ts';

const EN_NAMES = {
  cloth: 'Cloth binding', marble: 'Marbled paper', series: 'Publisher’s series', print60: '’60s print', ornament: 'Ornament',
  botany: 'Botany', avant: 'Avant-garde', bauhaus: 'Bauhaus', swiss: 'Swiss style', opart: 'Op art', nordic: 'Nordic',
  deco: 'Art Deco', nouveau: 'Art Nouveau', antique: 'Antiquity', manuscript: 'Manuscript', east: 'East', girih: 'Star geometry',
  typewriter: 'Typewriter', space: 'Space', guilloche: 'Guilloché', tiling: 'Tilings', curves: 'Curves', topo: 'Relief', arch: 'Architecture',
};

const EN = `Pride and Prejudice|Jane Austen
Moby-Dick|Herman Melville
Frankenstein|Mary Shelley
Jane Eyre|Charlotte Brontë
Great Expectations|Charles Dickens
The Picture of Dorian Gray|Oscar Wilde
Dracula|Bram Stoker
The Great Gatsby|F. Scott Fitzgerald
Mrs Dalloway|Virginia Woolf
Ulysses|James Joyce
Nineteen Eighty-Four|George Orwell
Brave New World|Aldous Huxley
The Old Man and the Sea|Ernest Hemingway
Of Mice and Men|John Steinbeck
To Kill a Mockingbird|Harper Lee
One Hundred Years of Solitude|Gabriel García Márquez
The Master and Margarita|Mikhail Bulgakov
Crime and Punishment|Fyodor Dostoevsky
War and Peace|Leo Tolstoy
The Hobbit|J. R. R. Tolkien
Fahrenheit 451|Ray Bradbury
Dune|Frank Herbert
Foundation|Isaac Asimov
The Left Hand of Darkness|Ursula K. Le Guin
Neuromancer|William Gibson
Slaughterhouse-Five|Kurt Vonnegut
Beloved|Toni Morrison
The Handmaid’s Tale|Margaret Atwood
The Remains of the Day|Kazuo Ishiguro
Middlemarch|George Eliot
Little Women|Louisa May Alcott
The Adventures of Sherlock Holmes|Arthur Conan Doyle
The Time Machine|H. G. Wells
Treasure Island|Robert Louis Stevenson
Alice’s Adventures in Wonderland|Lewis Carroll
Don Quixote|Miguel de Cervantes
The Odyssey|Homer
Invisible Cities|Italo Calvino
The Name of the Rose|Umberto Eco
The Trial|Franz Kafka
The Stranger|Albert Camus
Siddhartha|Hermann Hesse
Norwegian Wood|Haruki Murakami
The Road|Cormac McCarthy
Lolita|Vladimir Nabokov
Catch-22|Joseph Heller
The Sound and the Fury|William Faulkner
Rebecca|Daphne du Maurier
The Hitchhiker’s Guide to the Galaxy|Douglas Adams
The Secret History|Donna Tartt
Wolf Hall|Hilary Mantel
Gulliver’s Travels|Jonathan Swift
Robinson Crusoe|Daniel Defoe
The Count of Monte Cristo|Alexandre Dumas
Les Misérables|Victor Hugo
Madame Bovary|Gustave Flaubert
The Divine Comedy|Dante Alighieri
Leaves of Grass|Walt Whitman
Walden|Henry David Thoreau
On the Origin of Species|Charles Darwin
A Brief History of Time|Stephen Hawking
The Selfish Gene|Richard Dawkins
Gödel, Escher, Bach|Douglas Hofstadter
The Art of War|Sun Tzu
Meditations|Marcus Aurelius
The Prince|Niccolò Machiavelli
Thinking, Fast and Slow|Daniel Kahneman
Silent Spring|Rachel Carson
Cosmos|Carl Sagan
Solaris|Stanisław Lem
Roadside Picnic|Arkady and Boris Strugatsky
Persuasion|Jane Austen
Bleak House|Charles Dickens`;

const RU = `Мастер и Маргарита|Михаил Булгаков
Преступление и наказание|Фёдор Достоевский
Анна Каренина|Лев Толстой
Евгений Онегин|Александр Пушкин
Мёртвые души|Николай Гоголь
Отцы и дети|Иван Тургенев
Герой нашего времени|Михаил Лермонтов
Тихий Дон|Михаил Шолохов
Доктор Живаго|Борис Пастернак
Мы|Евгений Замятин
Пикник на обочине|Аркадий и Борис Стругацкие
Солярис|Станислав Лем
Вишнёвый сад|Антон Чехов
Обломов|Иван Гончаров
Двенадцать стульев|Илья Ильф и Евгений Петров
Котлован|Андрей Платонов
Защита Лужина|Владимир Набоков
Жизнь и судьба|Василий Гроссман
Москва — Петушки|Венедикт Ерофеев
Generation «П»|Виктор Пелевин
Лавр|Евгений Водолазкин
Петровы в гриппе и вокруг него|Алексей Сальников
Сто лет одиночества|Габриэль Гарсиа Маркес
1984|Джордж Оруэлл
Маленький принц|Антуан де Сент-Экзюпери
Портрет Дориана Грея|Оскар Уайльд
Над пропастью во ржи|Джером Сэлинджер
Три товарища|Эрих Мария Ремарк
Старик и море|Эрнест Хемингуэй
Процесс|Франц Кафка
Имя розы|Умберто Эко
Норвежский лес|Харуки Мураками
Гордость и предубеждение|Джейн Остин
Джейн Эйр|Шарлотта Бронте
Дракула|Брэм Стокер
Франкенштейн|Мэри Шелли
Моби Дик|Герман Мелвилл
Война и мир|Лев Толстой
Собачье сердце|Михаил Булгаков
Дюна|Фрэнк Герберт
Основание|Айзек Азимов
Краткая история времени|Стивен Хокинг
Эгоистичный ген|Ричард Докинз
Искусство войны|Сунь-цзы
Размышления|Марк Аврелий
Государь|Никколо Макиавелли
Космос|Карл Саган
Хоббит|Джон Р. Р. Толкин
Алиса в Стране чудес|Льюис Кэрролл
Остров сокровищ|Роберт Льюис Стивенсон
Робинзон Крузо|Даниэль Дефо
Граф Монте-Кристо|Александр Дюма
Отверженные|Виктор Гюго
Госпожа Бовари|Гюстав Флобер
Божественная комедия|Данте Алигьери
Происхождение видов|Чарльз Дарвин
Улисс|Джеймс Джойс
Бойня номер пять|Курт Воннегут
Левая рука тьмы|Урсула Ле Гуин
Нейромант|Уильям Гибсон
Рассказ служанки|Маргарет Этвуд
Не отпускай меня|Кадзуо Исигуро
Идиот|Фёдор Достоевский
Палата № 6|Антон Чехов`;

const parse = (s) => s.split('\n').map((l) => l.split('|'));

// 30 книг: сначала по одной на стиль, потом вторые книги тех же стилей; порядок перемешан по хешу названия.
function choose(list) {
  const by = new Map();
  for (const [title, author] of list) {
    const c = drawCover({ title, author });
    const id = STYLES.find((s) => s.name === c.style).id;
    if (!by.has(id)) by.set(id, []);
    by.get(id).push({ title, author, id, svg: c.svg });
  }
  const out = [...by.values()].map((l) => l[0]);
  for (const l of by.values()) if (out.length < 30 && l[1]) out.push(l[1]);
  return out.slice(0, 30).sort((a, b) => hash(a.title) - hash(b.title));
}

const fonts = readdirSync('fonts')
  .filter((f) => f.endsWith('.woff2'))
  .map((f) => {
    const key = f.replace('.woff2', '');
    const css = readFileSync('fonts/fonts.css', 'utf8');
    const weight = css.match(new RegExp(`pp-${key}[^}]*font-weight:\\s*(\\d+)`))?.[1] ?? '400';
    return `@font-face{font-family:pp-${key};font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${readFileSync('fonts/' + f).toString('base64')}) format("woff2")}`;
  })
  .join('');

const W = 150;
const COLS = 6;
const GAP = 22;
const PAD = 28;
const ROW = W * 1.5 + 26;
const width = PAD * 2 + COLS * W + (COLS - 1) * GAP;
const height = PAD * 2 + 5 * ROW + 4 * GAP;

mkdirSync('docs', { recursive: true });
mkdirSync('gallery/out', { recursive: true });
for (const [lang, list] of [
  ['en', parse(EN)],
  ['ru', parse(RU)],
]) {
  const items = choose(list);
  const name = (id) => (lang === 'en' ? EN_NAMES[id] : STYLES.find((s) => s.id === id).name);
  const html = `<!doctype html><meta charset="utf-8"><style>${fonts}
html,body{margin:0;background:#f4f2ee}
.g{display:grid;grid-template-columns:repeat(${COLS},${W}px);gap:${GAP}px;padding:${PAD}px}
.c{width:${W}px;height:${W * 1.5}px;border-radius:1px 3px 3px 1px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.25),0 4px 10px rgba(0,0,0,.14)}
.c svg{display:block;width:100%;height:100%}
.n{font:12px/1 system-ui,-apple-system,'Segoe UI',sans-serif;color:#6b6a66;margin-top:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style><div class="g">${items.map((b) => `<div><div class="c">${b.svg}</div><div class="n">${name(b.id)}</div></div>`).join('')}</div>`;
  const page = resolve(`gallery/out/readme-${lang}.html`);
  const png = resolve(`gallery/out/readme-${lang}.png`);
  writeFileSync(page, html);
  execFileSync(process.env.CHROME || 'google-chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', `--window-size=${width},${height}`, '--virtual-time-budget=5000', `--screenshot=${png}`, 'file://' + page], { stdio: 'ignore' });
  execFileSync('magick', [png, '-quality', '82', `docs/covers-${lang}.webp`]);
  rmSync(png);
  console.log(`docs/covers-${lang}.webp`, items.length, 'обложек,', new Set(items.map((b) => b.id)).size, 'стилей');
}
