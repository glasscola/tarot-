import { CARDS } from './cards.js';

const position = (name, meaning, role) => Object.freeze({ name, meaning, role });
const cell = (col, row) => Object.freeze({ col, row });

/** Cell order matches the stable draw/position order, rather than the visual row order. */
export const SPREADS = Object.freeze([
  Object.freeze({
    id: 'single', name: '한 장의 조언', subtitle: '지금 필요한 작은 실마리', count: 1,
    layout: 'single', columns: 1, rows: 1, cells: Object.freeze([cell(1, 1)]),
    layoutName: '한 장 배열',
    layoutDescription: '가운데 놓인 한 장을 읽습니다. 여러 문제를 한꺼번에 묻기보다 지금 살펴볼 한 가지 질문에 집중해 보세요.',
    question: '오늘 무엇에 집중하면 좋을까?',
    description: '한 장에 질문을 모아 보는 가장 간단한 배열입니다. 답을 단정하기보다 지금 살펴볼 태도와 작은 행동을 찾아보세요.',
    positions: Object.freeze([position('핵심 조언', '질문 앞에서 지금 가장 주의 깊게 살펴볼 태도와 행동입니다.', 'core')]),
  }),
  Object.freeze({
    id: 'timeline', name: '과거 · 현재 · 미래', subtitle: '이어지는 흐름을 바라보기', count: 3,
    layout: 'row', columns: 3, rows: 1, cells: Object.freeze([cell(1, 1), cell(2, 1), cell(3, 1)]),
    layoutName: '가로 3장 배열',
    layoutDescription: '왼쪽 1번 과거 → 가운데 2번 현재 → 오른쪽 3번 미래 순서로 놓습니다. 시간의 흐름을 따라 카드 사이의 변화를 읽어보세요.',
    question: '이 일은 어떤 흐름 속에 있고, 앞으로 무엇을 살펴보면 좋을까?',
    description: '왼쪽부터 과거의 영향, 현재 상황, 앞으로의 가능성을 읽는 널리 쓰이는 3장 배열입니다. 미래는 현재의 선택에 따라 달라질 수 있는 흐름으로 읽습니다.',
    positions: Object.freeze([
      position('과거', '지금의 질문에 영향을 남긴 경험이나 익숙한 패턴을 돌아봅니다.', 'past'),
      position('현재', '현재 눈여겨볼 상황, 마음, 관계의 중심을 살펴봅니다.', 'present'),
      position('미래', '현재 흐름이 이어질 때 나타날 수 있는 가능성과 준비할 점을 살펴봅니다.', 'future'),
    ]),
  }),
  Object.freeze({
    id: 'action', name: '상황 · 행동 · 흐름', subtitle: '생각에서 한 걸음 앞으로', count: 3,
    layout: 'row', columns: 3, rows: 1, cells: Object.freeze([cell(1, 1), cell(2, 1), cell(3, 1)]),
    layoutName: '가로 3장 배열',
    layoutDescription: '왼쪽 1번 상황 → 가운데 2번 행동 → 오른쪽 3번 흐름 순서로 놓습니다. 같은 가로 배열이어도 시간 대신 상황과 실천의 연결을 읽습니다.',
    question: '이 상황에서 내가 할 수 있는 다음 행동은 무엇일까?',
    description: '상황을 살펴보고 내가 취할 행동과 그 뒤의 흐름을 연결하는 3장 배열입니다. 조언을 오늘 할 수 있는 작은 행동으로 바꾸어 보세요.',
    positions: Object.freeze([
      position('상황', '현재 질문의 핵심이 되는 상황과 관점을 살펴봅니다.', 'present'),
      position('행동', '내가 조정하거나 시도해 볼 수 있는 태도와 행동입니다.', 'action'),
      position('흐름', '제안된 행동을 고려할 때 살펴볼 가능성과 점검할 방향입니다.', 'outcome'),
    ]),
  }),
  Object.freeze({
    id: 'insight', name: '다섯 장의 시선', subtitle: '복잡한 고민을 차분하게 나누기', count: 5,
    layout: 'cross', columns: 3, rows: 3,
    cells: Object.freeze([cell(2, 2), cell(2, 1), cell(1, 2), cell(3, 2), cell(2, 3)]),
    layoutName: '십자 5장 배열',
    layoutDescription: '1번 현재를 가운데, 2번 배경을 위, 3번 방해를 왼쪽, 4번 도움을 오른쪽, 5번 조언을 아래에 놓습니다. 중심을 둘러싼 요인을 비교하도록 이 앱에서 구성했습니다.',
    question: '이 고민의 배경과 걸림돌을 살펴보고, 무엇부터 풀어가면 좋을까?',
    description: '초보자가 복잡한 고민을 나누어 살펴보도록 이 앱에서 구성한 5장 배열입니다. 현재, 배경, 방해, 도움, 조언을 순서대로 읽습니다. 전통 배열의 유일한 표준을 뜻하지 않습니다.',
    positions: Object.freeze([
      position('현재', '질문의 중심에 놓인 현재의 상태를 살펴봅니다.', 'present'),
      position('배경', '겉으로 드러난 상황 뒤에 있는 경험이나 전제를 돌아봅니다.', 'background'),
      position('방해 요소', '진행을 어렵게 하거나 지나치게 힘을 쓰고 있는 부분입니다.', 'obstacle'),
      position('도움 요소', '지금 활용할 수 있는 자원, 태도, 지지를 살펴봅니다.', 'support'),
      position('조언', '다른 자리의 의미를 참고해 시도할 다음 한 걸음입니다.', 'advice'),
    ]),
  }),
  Object.freeze({
    id: 'choice', name: '두 갈래의 선택', subtitle: '가능성과 부담을 함께 살피기', count: 5,
    layout: 'fork', columns: 3, rows: 3,
    cells: Object.freeze([cell(2, 1), cell(1, 2), cell(1, 3), cell(3, 2), cell(3, 3)]),
    layoutName: '두 갈래 5장 배열',
    layoutDescription: '맨 위 가운데 1번 현재에서 왼쪽 A와 오른쪽 B로 나뉩니다. 2·3번은 A의 가능성·주의점, 4·5번은 B의 가능성·주의점입니다. 두 선택을 나란히 비교하도록 이 앱에서 구성했습니다.',
    question: 'A와 B 중 무엇을 고려하면 내게 맞는 선택을 할 수 있을까?',
    description: '두 선택을 비교하도록 이 앱에서 구성한 5장 배열입니다. 질문에 A와 B가 무엇인지 적고 각 선택의 가능성과 주의점을 읽어보세요. 카드가 선택을 대신 결정하지는 않습니다.',
    positions: Object.freeze([
      position('현재', '두 선택 앞에 있는 현재의 마음과 기준을 살펴봅니다.', 'present'),
      position('A의 가능성', '선택 A에서 살려볼 수 있는 기회와 방향을 살펴봅니다.', 'choiceA'),
      position('A의 주의점', '선택 A에서 더 확인하거나 조정해야 할 부분입니다.', 'cautionA'),
      position('B의 가능성', '선택 B에서 살려볼 수 있는 기회와 방향을 살펴봅니다.', 'choiceB'),
      position('B의 주의점', '선택 B에서 더 확인하거나 조정해야 할 부분입니다.', 'cautionB'),
    ]),
  }),
  Object.freeze({
    id: 'relationship', name: '관계의 접점', subtitle: '나와 상대 사이를 차분하게 살피기', count: 3,
    layout: 'triangle', columns: 3, rows: 2,
    cells: Object.freeze([cell(1, 1), cell(3, 1), cell(2, 2)]),
    layoutName: '삼각형 3장 배열',
    layoutDescription: '1번 나의 태도를 왼쪽 위, 2번 상대에게 확인할 점을 오른쪽 위, 3번 관계의 접점을 아래 가운데에 놓습니다. 두 시선이 만나는 지점을 살피도록 이 앱에서 구성한 배열입니다.',
    question: '이 관계에서 내 태도를 돌아보고, 어떤 대화를 나누면 좋을까?',
    description: '연인, 친구, 가족, 동료와의 소통을 살펴보도록 이 앱에서 구성한 3장 배열입니다. 상대의 속마음을 알아맞히기보다 내 태도, 직접 확인할 점, 함께 조율할 부분을 읽습니다.',
    positions: Object.freeze([
      position('나의 태도', '이 관계에서 내가 보이는 반응과 조절할 수 있는 태도를 돌아봅니다.', 'selfAttitude'),
      position('상대에게 확인할 점', '상대의 마음을 단정하지 않고 대화로 확인해 볼 필요나 경계를 살펴봅니다.', 'otherCheck'),
      position('관계의 접점', '서로의 차이를 인정하며 함께 이야기하거나 조율해 볼 부분입니다.', 'connection'),
    ]),
  }),
]);

export const TOPICS = Object.freeze([
  Object.freeze({ id: 'general', name: '일상 · 전체', hint: '지금 내 삶에서 살펴볼 일과 다음 한 걸음' }),
  Object.freeze({ id: 'love', name: '관계 · 마음', hint: '내 마음, 서로의 소통과 건강한 관계의 경계' }),
  Object.freeze({ id: 'work', name: '일 · 배움', hint: '진행 중인 일, 공부, 협업과 선택의 기준' }),
  Object.freeze({ id: 'self', name: '나 · 성장', hint: '내가 원하는 것과 반복되는 마음의 습관' }),
]);

const CARD_BY_ID = new Map(CARDS.map(card => [card.id, card]));
const TOPIC_BY_ID = new Map(TOPICS.map(topic => [topic.id, topic]));
const TOPIC_LENS = {
  general: {
    context: '일상에서 조절할 수 있는 시간, 에너지, 선택을 떠올려 보세요.',
    reflection: '내가 오늘 직접 바꿀 수 있는 가장 작은 부분은 무엇인가요?',
    focus: '모든 것을 한 번에 해결하기보다 오늘 가능한 한 가지를 골라보세요.',
  },
  love: {
    context: '상대의 속마음을 확정하기보다 내 감정과 실제로 오간 말, 서로의 경계를 살펴보세요.',
    reflection: '추측을 덜고 차분하게 확인해 볼 마음이나 필요는 무엇인가요?',
    focus: '내 마음을 설명하는 한 문장과 상대에게 확인하고 싶은 한 가지를 구분해 보세요.',
  },
  work: {
    context: '내가 맡은 일, 사용할 수 있는 자원, 실제로 확인할 수 있는 정보를 기준으로 생각해 보세요.',
    reflection: '다음 결정을 하기 전에 확인해야 할 정보나 작은 실험은 무엇인가요?',
    focus: '일의 크기를 줄여 다음 행동, 필요한 도움, 확인할 시점을 정해 보세요.',
  },
  self: {
    context: '다른 사람의 기대와 내가 실제로 원하는 것을 구분해 살펴보세요.',
    reflection: '이 카드의 주제 가운데 내 경험과 맞닿는 부분, 맞지 않는 부분은 무엇인가요?',
    focus: '자신을 평가하기보다 반복되는 반응 하나를 알아차리고 다른 선택을 시도해 보세요.',
  },
};

/** A question is saved as plain text, never evaluated or inserted as markup by this module. */
export function validateQuestion(question) {
  if (typeof question !== 'string') throw new Error('살펴보고 싶은 질문을 글로 적어 주세요.');
  const value = question.trim();
  if (!value) throw new Error('살펴보고 싶은 질문을 먼저 적어 주세요.');
  if ([...value].length > 240) throw new Error('질문은 240자 이내로 적어 주세요.');
  return value;
}

function randomInteger(maximum) {
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 0x100000000) {
    throw new Error('카드를 섞을 수 있는 범위를 확인해 주세요.');
  }
  if (!globalThis.crypto?.getRandomValues) throw new Error('이 브라우저에서는 안전한 카드 섞기를 사용할 수 없습니다. 최신 브라우저로 열어 주세요.');
  // Rejection sampling avoids the modulo bias of a single random uint32 % n.
  const limit = Math.floor(0x100000000 / maximum) * maximum;
  const buffer = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % maximum;
}

/** Fisher–Yates; input cards and their order are never changed. Orientations are sampled independently. */
export function shuffleDeck(cards, allowReversed = false) {
  if (!Array.isArray(cards) || cards.length === 0) throw new Error('섞을 카드가 없습니다.');
  if (typeof allowReversed !== 'boolean') throw new Error('역방향 사용 설정을 확인해 주세요.');
  const ids = cards.map(card => card?.id);
  if (ids.some(id => typeof id !== 'string' || !CARD_BY_ID.has(id)) || new Set(ids).size !== ids.length) {
    throw new Error('카드 목록에 중복되거나 알 수 없는 카드가 있습니다.');
  }
  const deck = ids.map(id => ({ id, reversed: allowReversed ? randomInteger(2) === 1 : false }));
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = randomInteger(index + 1);
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return deck;
}

function roleInterpretation(role, keyword, reversed) {
  const lastCode = keyword.trim().at(-1).charCodeAt(0);
  const hasFinalConsonant = lastCode >= 0xAC00 && lastCode <= 0xD7A3 && (lastCode - 0xAC00) % 28 !== 0;
  const subject = `‘${keyword}’${hasFinalConsonant ? '이' : '가'}`;
  const object = `‘${keyword}’${hasFinalConsonant ? '을' : '를'}`;
  const companion = `‘${keyword}’${hasFinalConsonant ? '과' : '와'}`;
  const uprightRoles = {
    core: `지금의 고민에서는 ${companion} 맞닿는 부분에 마음을 모아보세요. 그 주제를 내 상황에서 작게 살펴볼 방법이 핵심 실마리가 될 수 있습니다.`,
    past: `과거의 경험 중 ${companion} 닮은 장면이 지금의 선택에 남아 있는지 돌아보세요. 당시 도움이 되었던 반응과 지금은 바꾸고 싶은 반응을 구분해 보면 좋겠습니다.`,
    present: `현재는 ${subject} 내 마음과 실제 상황에서 어떻게 드러나는지 살펴볼 때입니다. 확인할 수 있는 사실을 바탕으로 지금 가장 필요한 것을 짚어보세요.`,
    future: `앞으로 ${companion} 관련된 가능성을 살펴볼 시점입니다. 현재의 선택과 주변 조건에 따라 흐름은 달라질 수 있으니, 이 주제를 준비와 관찰의 단서로 삼아보세요.`,
    action: `다음 행동을 정할 때는 ${object} 단서로 삼아보세요. 카드가 떠올리게 하는 태도 중 내가 직접 조절할 수 있는 부분을 작게 시도해 보면 좋겠습니다.`,
    outcome: `앞으로의 흐름에서 ${subject} 어떤 모습으로 드러나는지 관찰해 보세요. 행동을 시도한 뒤 실제 변화와 비교하며 방향을 조정할 수 있습니다.`,
    background: `지금 고민 뒤에 ${companion} 닮은 경험이나 기대가 놓여 있는지 살펴보세요. 당연하게 여겨온 생각을 알아차리면 현재 상황을 다른 각도에서 이해하는 데 도움이 될 수 있습니다.`,
    obstacle: `${object} 지키려는 마음이 지나치거나 한 가지 방식으로 굳어져 부담이 되는지 살펴보세요. 필요한 만큼만 힘을 쓰도록 기준과 경계를 조정해 보면 좋겠습니다.`,
    support: `${companion} 닮은 태도나 자원을 지금 활용할 수 있는지 찾아보세요. 이미 가진 능력이나 도움을 청할 수 있는 사람에게서 작은 지지를 발견할 수 있습니다.`,
    advice: `다음 선택에서는 ${object} 어떤 방식으로 다룰지 생각해 보세요. 앞서 나온 카드들과 함께 읽고, 지금 실행할 수 있는 한 가지로 범위를 좁혀보면 좋겠습니다.`,
    choiceA: `A를 선택할 때 ${companion} 관련해 살려볼 가능성이 있는지 살펴보세요. 원하는 방향과 실제 조건이 맞닿는 부분을 확인하면 A의 장점을 더 구체적으로 비교할 수 있습니다.`,
    cautionA: `A에서는 ${subject} 지나치거나 한쪽으로 치우칠 때 생길 부담을 살펴보세요. 감당할 시간과 에너지, 지켜야 할 경계를 미리 확인하면 좋겠습니다.`,
    choiceB: `B를 선택할 때 ${companion} 관련해 살려볼 가능성이 있는지 살펴보세요. 원하는 방향과 실제 조건이 맞닿는 부분을 확인하면 B의 장점을 더 구체적으로 비교할 수 있습니다.`,
    cautionB: `B에서는 ${subject} 지나치거나 한쪽으로 치우칠 때 생길 부담을 살펴보세요. 감당할 시간과 에너지, 지켜야 할 경계를 미리 확인하면 좋겠습니다.`,
    selfAttitude: `이 관계에서 ${companion} 닮은 내 반응이 어떻게 드러나는지 돌아보세요. 상대를 바꾸려 하기 전에 내가 표현할 마음과 지킬 경계를 구분해 보면 좋겠습니다.`,
    otherCheck: `${object} 상대의 실제 마음이라고 단정하지 말고, 대화의 단서로 삼아보세요. 이 주제와 관련해 서로 원하는 것이 무엇인지 열린 질문으로 확인해 보면 좋겠습니다.`,
    connection: `${companion} 관련해 서로 함께 시도해 볼 수 있는 작은 약속을 찾아보세요. 같은 생각이라고 가정하기보다 각자의 필요를 말하고 동의할 수 있는 범위를 조율해 보면 좋겠습니다.`,
  };
  const reversedRoles = {
    core: `지금은 ${subject} 잘 드러나지 않거나 지나치게 힘을 쓰는 부분을 먼저 살펴보세요. 바깥의 답을 서둘러 찾기보다 내 안의 반응을 알아차리는 일이 실마리가 될 수 있습니다.`,
    past: `지난 경험에서 ${subject} 막혔거나 지나쳤던 부분이 있다면, 그때의 반응이 지금도 이어지는지 돌아보세요. 오래된 방식을 그대로 반복해야 하는지 차분히 점검해 보면 좋겠습니다.`,
    present: `현재는 ${subject} 잘 드러나지 않거나 필요 이상으로 강해진 부분이 있는지 살펴볼 때입니다. 겉으로 보이는 모습과 내 안에서 느끼는 마음의 차이를 먼저 짚어보세요.`,
    future: `앞으로는 ‘${keyword}’의 막힘이나 과도함을 조정할 가능성을 살펴보세요. 현재의 반응을 바꾸면 흐름도 달라질 수 있으니, 같은 패턴이 나타날 때 멈추어 확인할 기준을 준비해 보면 좋겠습니다.`,
    action: `행동에 앞서 ${object} 억누르거나 과하게 밀어붙이고 있는지 확인해 보세요. 큰 시도보다 막힌 지점 하나를 풀거나 강도를 낮추는 작은 행동에서 시작해 보면 좋겠습니다.`,
    outcome: `행동 뒤에는 ${subject} 막히거나 과도하게 드러나는 순간이 있는지 관찰해 보세요. 기대한 변화가 보이지 않더라도 결과를 서둘러 확정하지 말고 속도와 방법을 조정해 볼 여지가 있습니다.`,
    background: `‘${keyword}’에 관해 드러내지 못한 마음이나 지나치게 붙잡은 기대가 고민의 배경에 있는지 살펴보세요. 내 안에서 반복되는 생각을 적어보면 현재의 반응을 이해하는 데 도움이 될 수 있습니다.`,
    obstacle: `${subject} 충분히 드러나지 않거나 지나치게 반복되는 부분이 걸림돌이 되는지 살펴보세요. 더 밀어붙이기 전에 무엇이 막혀 있고 어디에 힘을 덜 써도 되는지 나누어 보면 좋겠습니다.`,
    support: `${object} 밖으로 펼치기 어렵다면 내 안에서 이미 쓰고 있는 작은 힘부터 찾아보세요. 부담이 적은 방식으로 연습하거나 지지를 구하면 막힌 자원을 다시 활용할 단서를 얻을 수 있습니다.`,
    advice: `지금의 조언은 ${object} 더 강하게 밀기보다 막힘과 과도함 사이의 균형을 살펴보는 쪽에 있습니다. 앞선 카드들에서 부담이 겹치는 부분을 골라 작은 조정부터 시도해 보세요.`,
    choiceA: `A에서 ‘${keyword}’의 가능성을 살리려면 무엇이 막혀 있거나 과도한지 먼저 확인해 보세요. 필요한 준비와 내 마음의 저항을 나누어 살피면 실제로 열려 있는 여지를 비교하기 좋습니다.`,
    cautionA: `A에서는 ${object} 억누르거나 과하게 기대하는 부분이 부담을 키울 수 있는지 살펴보세요. 숨겨진 감정과 아직 확인하지 못한 조건을 구분한 뒤 선택의 기준을 다듬어 보면 좋겠습니다.`,
    choiceB: `B에서 ‘${keyword}’의 가능성을 살리려면 무엇이 막혀 있거나 과도한지 먼저 확인해 보세요. 필요한 준비와 내 마음의 저항을 나누어 살피면 실제로 열려 있는 여지를 비교하기 좋습니다.`,
    cautionB: `B에서는 ${object} 억누르거나 과하게 기대하는 부분이 부담을 키울 수 있는지 살펴보세요. 숨겨진 감정과 아직 확인하지 못한 조건을 구분한 뒤 선택의 기준을 다듬어 보면 좋겠습니다.`,
    selfAttitude: `이 관계에서 ${object} 억누르거나 지나치게 드러내는 내 반응이 있는지 살펴보세요. 감정의 이름을 붙이고, 부담이 적은 표현부터 연습해 보면 좋겠습니다.`,
    otherCheck: `${subject} 막히거나 과도하다는 해석을 상대에게 그대로 적용하지 마세요. 내가 짐작한 부분과 실제로 들은 말을 구분하고, 아직 확인하지 못한 필요를 차분히 물어보세요.`,
    connection: `${subject} 관계 안에서 막히거나 과도하게 느껴진다면, 함께 감당할 수 있는 대화의 속도와 경계부터 맞추어 보세요. 서로 동의한 작은 조정을 시도하고 실제 반응을 살펴보면 좋겠습니다.`,
  };
  return (reversed ? reversedRoles : uprightRoles)[role];
}

function uniqueId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return Array.from({ length: 4 }, () => randomInteger(0x100000000).toString(16).padStart(8, '0')).join('-');
}

function summarize(spreadId, entries, topic) {
  const key = index => `${entries[index].keywords[0]}${entries[index].reversed ? ' (역방향)' : ''}`;
  const summaries = {
    single: () => `지금의 핵심 주제는 ‘${key(0)}’입니다. 카드의 뜻을 질문에 비추어 보고, 현재 내게 필요한 태도 한 가지를 골라보세요.`,
    timeline: () => `과거의 주제는 ‘${key(0)}’, 현재의 주제는 ‘${key(1)}’입니다. 미래의 주제인 ‘${key(2)}’에서 앞으로 살펴볼 가능성을 찾아보세요. 세 주제가 내 경험에서 어떻게 이어지는지 돌아보면 좋겠습니다.`,
    action: () => `현재의 주제인 ‘${key(0)}’에서 필요한 부분을 살펴보고, 행동의 주제인 ‘${key(1)}’에서 작은 실천을 찾아보세요. 흐름의 주제인 ‘${key(2)}’에서는 그 뒤에 관찰하고 점검할 방향을 살펴봅니다.`,
    insight: () => `현재의 주제는 ‘${key(0)}’, 배경의 주제는 ‘${key(1)}’입니다. 두 주제가 어떻게 닿아 있는지 살펴보세요. 방해 요소인 ‘${key(2)}’에서 점검할 부분을, 도움 요소인 ‘${key(3)}’에서 활용할 자원을 찾고, 조언의 주제인 ‘${key(4)}’에서 다음 행동을 찾아보세요.`,
    choice: () => `A는 ‘${key(1)}’의 가능성과 ‘${key(2)}’의 주의점을, B는 ‘${key(3)}’의 가능성과 ‘${key(4)}’의 주의점을 함께 읽습니다. 현재의 주제인 ‘${key(0)}’에서 내 선택 기준을 돌아보세요. 어느 쪽이 더 좋은지는 실제 조건과 내 우선순위로 결정합니다.`,
    relationship: () => `나의 태도에서 읽을 주제는 ‘${key(0)}’, 상대에게 확인할 점은 ‘${key(1)}’, 관계의 접점은 ‘${key(2)}’입니다. 내 반응과 상대에 대한 추측을 구분하고, 함께 이야기할 수 있는 한 가지를 찾아보세요. 이 카드는 상대의 마음이나 관계의 결말을 확정하지 않습니다.`,
  };
  const reversedCount = entries.filter(entry => entry.reversed).length;
  return `${summaries[spreadId]()}${reversedCount ? ` 역방향 ${reversedCount}장은 힘의 막힘·과도함·내면화를 점검하는 관점으로 읽었습니다.` : ''} ${TOPIC_LENS[topic].context}`;
}

function connectionFocus(spreadId, topic) {
  const connections = {
    single: '카드의 주제와 닮은 실제 경험 하나를 떠올리고, 아직 확인하지 못한 추측과 구분해 보세요.',
    timeline: '과거와 현재 카드의 닮은 점 하나와 달라진 점 하나를 찾아보세요. 미래 카드는 그 차이를 어떻게 이어갈지 생각하는 단서로 두세요.',
    action: '상황 카드가 보여주는 필요와 행동 카드의 제안이 맞닿는 지점을 찾아보세요. 흐름 카드를 참고해 어떤 변화를 관찰할지 정해 보세요.',
    insight: '방해 요소와 도움 요소가 같은 힘의 부족함과 과도함을 서로 다르게 보여주는지 비교해 보세요. 조언 카드를 참고해 두 힘의 균형을 맞출 방법을 찾아보세요.',
    choice: 'A와 B에서 공통으로 나타나는 주제와 다른 주제를 구분해 보세요. 각 선택에 필요한 준비와 감당할 부담을 실제 조건에 맞추어 비교해 보세요.',
    relationship: '나의 태도 카드와 확인할 점 카드를 비교해, 내가 바꿀 부분과 상대에게 직접 물을 부분을 나누어 보세요. 접점 카드를 참고해 서로 동의할 수 있는 대화나 작은 약속 하나를 정해 보세요.',
  };
  return `${connections[spreadId]} ${TOPIC_LENS[topic].focus}`;
}

/** Original, deterministic card/position/topic composition. The free-text question is never parsed to invent facts. */
export function makeReading({ question, topic = 'general', spreadId = 'timeline', selected, date } = {}) {
  const cleanQuestion = validateQuestion(question);
  const spread = SPREADS.find(item => item.id === spreadId);
  if (!spread) throw new Error('사용할 카드 배열을 다시 선택해 주세요.');
  if (!TOPIC_BY_ID.has(topic)) throw new Error('질문의 주제를 다시 선택해 주세요.');
  if (!Array.isArray(selected) || selected.length !== spread.count) throw new Error(`이 배열은 카드 ${spread.count}장이 필요합니다.`);
  const ids = selected.map(item => item?.id);
  if (new Set(ids).size !== ids.length || ids.some(id => !CARD_BY_ID.has(id))) throw new Error('선택한 카드가 중복되거나 올바르지 않습니다. 다시 뽑아 주세요.');
  if (selected.some(item => item.reversed !== undefined && typeof item.reversed !== 'boolean')) throw new Error('카드 방향을 확인해 주세요.');
  const created = date === undefined ? new Date() : new Date(date);
  if (!Number.isFinite(created.getTime())) throw new Error('기록 날짜가 올바르지 않습니다.');
  const entries = selected.map((drawn, index) => {
    const card = CARD_BY_ID.get(drawn.id);
    const slot = spread.positions[index];
    const reversed = Boolean(drawn.reversed);
    const keywords = [...card.keywords];
    return {
      id: card.id, name: card.name, english: card.english, reversed,
      positionName: slot.name, positionMeaning: slot.meaning, keywords,
      cardMeaning: reversed ? card.reversed : card.upright,
      interpretation: roleInterpretation(slot.role, keywords[0], reversed),
      advice: card.advice,
    };
  });
  return {
    id: uniqueId(), date: created.toISOString(), question: cleanQuestion, topic,
    topicName: TOPIC_BY_ID.get(topic).name, spreadId, spreadName: spread.name,
    summary: summarize(spreadId, entries, topic),
    focus: connectionFocus(spreadId, topic),
    reflection: spreadId === 'relationship'
      ? '내가 실제로 보고 들은 것은 무엇이며, 아직 추측하고 있는 것은 무엇인가요? 상대의 대답을 열어 두고 확인할 질문 한 가지를 적어보세요.'
      : TOPIC_LENS[topic].reflection,
    entries,
  };
}

/** Plain text designed for clipboard, saved notes, and the Web Share API. */
export function formatReading(reading, { hideQuestion = false } = {}) {
  if (!reading || !Array.isArray(reading.entries)) throw new Error('복사할 결과를 찾을 수 없습니다.');
  const date = new Date(reading.date);
  const readableDate = Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
    : String(reading.date ?? '');
  const lines = [
    '월솜 타로 · 타로 리딩',
    `${readableDate} · ${reading.spreadName} · ${reading.topicName}`,
    ...(hideQuestion ? [] : ['', `질문: ${reading.question}`]),
    '', '전체 흐름', reading.summary,
  ];
  reading.entries.forEach((entry, index) => {
    lines.push(
      '', `${index + 1}. ${entry.positionName} — ${entry.name} (${entry.reversed ? '역방향' : '정방향'})`,
      `자리의 의미: ${entry.positionMeaning}`,
      `핵심어: ${entry.keywords.join(' · ')}`,
      `카드의 뜻: ${entry.cardMeaning}`,
      `이 자리에서: ${entry.interpretation}`,
      `작은 조언: ${entry.advice}`,
    );
  });
  lines.push('', '오늘의 한 걸음', reading.focus, '', '나에게 묻기', reading.reflection,
    '', '이 해설은 카드·자리·선택한 주제별 문장을 조합한 자기 성찰용 안내입니다. 미래나 다른 사람의 마음을 확정하지 않습니다.');
  return lines.join('\n');
}

/**
 * Solar calendar; Tarot School MM + DD + CC + YY reduction, including its three-card 19 exception.
 * Formula reference: https://www.thetarotschool.com/BirthCards2.html (consulted 2026-10-18).
 * All explanatory Korean text in this module is original to this application.
 */
export function birthCards(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) throw new Error('생일을 양력 YYYY-MM-DD 형식으로 입력해 주세요.');
  const [year, month, day] = dateString.split('-').map(Number);
  const solar = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || solar.getUTCFullYear() !== year || solar.getUTCMonth() !== month - 1 || solar.getUTCDate() !== day) {
    throw new Error('1900년 이후의 실제 양력 생일을 입력해 주세요.');
  }
  const now = new Date();
  const todaySeoul = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (dateString > todaySeoul) throw new Error('미래 날짜는 생일로 계산할 수 없습니다.');
  const century = Math.floor(year / 100);
  const shortYear = year % 100;
  const total = month + day + century + shortYear;
  const steps = [`${month} + ${day} + ${century} + ${shortYear} = ${total}`];
  let first = total;
  while (first > 21) {
    const values = first >= 100 ? [Math.floor(first / 10), first % 10] : String(first).split('').map(Number);
    const next = values.reduce((sum, value) => sum + value, 0);
    steps.push(`${values.join(' + ')} = ${next}${first >= 100 ? ' (세 자리 수는 앞 두 자리를 하나로 계산)' : ''}`);
    first = next;
  }
  let numbers;
  if (first === 19) {
    numbers = [19, 10, 1];
    steps.push('1 + 9 = 10', '1 + 0 = 1', '19는 19 · 10 · 1의 세 카드로 읽습니다.');
  } else if (first < 10) {
    numbers = [first + 9, first];
    steps.push(`${first}의 짝인 ${first + 9}을 함께 읽습니다.`);
  } else {
    const reduced = String(first).split('').reduce((sum, value) => sum + Number(value), 0);
    numbers = [first, reduced];
    steps.push(`${String(first).split('').join(' + ')} = ${reduced}`);
  }
  return {
    date: dateString, total, steps, numbers,
    cards: numbers.map(number => {
      const card = CARD_BY_ID.get(`m${String(number).padStart(2, '0')}`);
      return { ...card, keywords: [...card.keywords] };
    }),
    method: 'Tarot School 방식',
  };
}
