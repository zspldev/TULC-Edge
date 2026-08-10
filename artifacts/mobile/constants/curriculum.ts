export type Subject = 'science' | 'maths';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  marathiTitle: string;
  /**
   * Curriculum context is fetched live from ZKE RAG at session start.
   * This field is intentionally empty — it exists as a fallback label only.
   * Do NOT populate it with hand-written or AI-generated content.
   */
  context: string;
}

export interface SubjectInfo {
  id: Subject;
  title: string;
  marathiTitle: string;
  color: string;
  darkColor: string;
  icon: string; // Ionicons name
  chapters: Chapter[];
}

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'science',
    title: 'Science',
    marathiTitle: 'विज्ञान',
    color: '#0891B2',
    darkColor: '#22D3EE',
    icon: 'flask',
    chapters: [
      // Chapter titles verified against BalBharati Std 8 General Science textbook via ZKE RAG.
      // context fields are intentionally empty — real content is fetched from ZKE at session start.
      {
        id: 'sci-1',
        number: 1,
        title: 'Living World and Classification of Microbes',
        marathiTitle: 'सजीव सृष्टी आणि सूक्ष्मजीवांचे वर्गीकरण',
        context: '',
      },
      {
        id: 'sci-2',
        number: 2,
        title: 'Health and Diseases',
        marathiTitle: 'आरोग्य आणि रोग',
        context: '',
      },
      {
        id: 'sci-3',
        number: 3,
        title: 'Force and Pressure',
        marathiTitle: 'बल आणि दाब',
        context: '',
      },
      {
        id: 'sci-4',
        number: 4,
        title: 'Current Electricity and Magnetism',
        marathiTitle: 'विद्युत प्रवाह आणि चुंबकत्व',
        context: '',
      },
      {
        id: 'sci-5',
        number: 5,
        title: 'Inside the Atom',
        marathiTitle: 'अणूची अंतर्रचना',
        context: '',
      },
      {
        id: 'sci-6',
        number: 6,
        title: 'Composition of Matter',
        marathiTitle: 'पदार्थांची रचना',
        context: '',
      },
      {
        id: 'sci-7',
        number: 7,
        title: 'Metals and Nonmetals',
        marathiTitle: 'धातू आणि अधातू',
        context: '',
      },
      {
        id: 'sci-8',
        number: 8,
        title: 'Pollution',
        marathiTitle: 'प्रदूषण',
        context: '',
      },
      {
        id: 'sci-9',
        number: 9,
        title: 'Disaster Management',
        marathiTitle: 'आपत्ती व्यवस्थापन',
        context: '',
      },
      {
        id: 'sci-10',
        number: 10,
        title: 'Cell and Cell Organelles',
        marathiTitle: 'पेशी आणि पेशीांगे',
        context: '',
      },
      {
        id: 'sci-11',
        number: 11,
        title: 'Human Body and Organ System',
        marathiTitle: 'मानवी शरीर आणि इंद्रिय संस्था',
        context: '',
      },
      {
        id: 'sci-12',
        number: 12,
        title: 'Introduction to Acid and Base',
        marathiTitle: 'आम्ल व आम्लारी ओळख',
        context: '',
      },
      {
        id: 'sci-13',
        number: 13,
        title: 'Chemical Change and Chemical Bond',
        marathiTitle: 'रासायनिक अभिक्रिया आणि रासायनिक बंध',
        context: '',
      },
      {
        id: 'sci-14',
        number: 14,
        title: 'Measurement and Effects of Heat',
        marathiTitle: 'उष्णतेचे मापन आणि परिणाम',
        context: '',
      },
      {
        id: 'sci-15',
        number: 15,
        title: 'Sound',
        marathiTitle: 'ध्वनी',
        context: '',
      },
      {
        id: 'sci-16',
        number: 16,
        title: 'Reflection of Light',
        marathiTitle: 'प्रकाशाचे परावर्तन',
        context: '',
      },
      {
        id: 'sci-17',
        number: 17,
        title: 'Man-made Materials',
        marathiTitle: 'मानवनिर्मित पदार्थ',
        context: '',
      },
      {
        id: 'sci-18',
        number: 18,
        title: 'Ecosystems',
        marathiTitle: 'परिसंस्था',
        context: '',
      },
      {
        id: 'sci-19',
        number: 19,
        title: 'Life Cycle of Stars',
        marathiTitle: 'तार्‍यांचे जीवनचक्र',
        context: '',
      },
    ],
  },
  {
    id: 'maths',
    title: 'Mathematics',
    marathiTitle: 'गणित',
    color: '#7C3AED',
    darkColor: '#9B6DFF',
    icon: 'calculator',
    chapters: [
      // Chapter titles verified against BalBharati Std 8 Mathematics textbook via ZKE RAG.
      // Miscellaneous Exercise chapters (10 and 19 in the textbook) excluded as they are
      // revision exercises, not standalone chapters. context fields intentionally empty.
      {
        id: 'math-1',
        number: 1,
        title: 'Rational and Irrational Numbers',
        marathiTitle: 'परिमेय आणि अपरिमेय संख्या',
        context: '',
      },
      {
        id: 'math-2',
        number: 2,
        title: 'Parallel Lines and Transversals',
        marathiTitle: 'समांतर रेषा आणि छेदक',
        context: '',
      },
      {
        id: 'math-3',
        number: 3,
        title: 'Indices and Cube Root',
        marathiTitle: 'घातांक आणि घनमूळ',
        context: '',
      },
      {
        id: 'math-4',
        number: 4,
        title: 'Altitudes and Medians of a Triangle',
        marathiTitle: 'त्रिकोणाच्या उंच्या आणि मध्यगा',
        context: '',
      },
      {
        id: 'math-5',
        number: 5,
        title: 'Expansion Formulae',
        marathiTitle: 'विस्तार सूत्रे',
        context: '',
      },
      {
        id: 'math-6',
        number: 6,
        title: 'Factorisation of Algebraic Expressions',
        marathiTitle: 'बीजीय राशींचे गुणनखंड',
        context: '',
      },
      {
        id: 'math-7',
        number: 7,
        title: 'Variation',
        marathiTitle: 'प्रमाण',
        context: '',
      },
      {
        id: 'math-8',
        number: 8,
        title: 'Quadrilateral: Constructions and Types',
        marathiTitle: 'चतुर्भुज: रचना आणि प्रकार',
        context: '',
      },
      {
        id: 'math-9',
        number: 9,
        title: 'Discount and Commission',
        marathiTitle: 'सवलत आणि दलाली',
        context: '',
      },
      {
        id: 'math-10',
        number: 11,
        title: 'Division of Polynomials',
        marathiTitle: 'बहुपदींचा भागाकार',
        context: '',
      },
      {
        id: 'math-11',
        number: 12,
        title: 'Statistics',
        marathiTitle: 'सांख्यिकी',
        context: '',
      },
      {
        id: 'math-12',
        number: 13,
        title: 'Equations in One Variable',
        marathiTitle: 'एका चलातील समीकरण',
        context: '',
      },
      {
        id: 'math-13',
        number: 14,
        title: 'Congruence of Triangles',
        marathiTitle: 'त्रिकोणांची सर्वांगसमता',
        context: '',
      },
      {
        id: 'math-14',
        number: 15,
        title: 'Compound Interest',
        marathiTitle: 'चक्रवाढ व्याज',
        context: '',
      },
      {
        id: 'math-15',
        number: 16,
        title: 'Area',
        marathiTitle: 'क्षेत्रफळ',
        context: '',
      },
      {
        id: 'math-16',
        number: 17,
        title: 'Surface Area and Volume',
        marathiTitle: 'पृष्ठफळ आणि घनफळ',
        context: '',
      },
      {
        id: 'math-17',
        number: 18,
        title: 'Circle: Chord and Arc',
        marathiTitle: 'वर्तुळ: जीवा आणि चाप',
        context: '',
      },
    ],
  },
];

export function getSubject(id: string): SubjectInfo | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getChapter(subjectId: string, chapterId: string): Chapter | undefined {
  const subject = getSubject(subjectId);
  return subject?.chapters.find((c) => c.id === chapterId);
}
