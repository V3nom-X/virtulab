export interface ReproductiveExperiment {
  id: string;
  title: string;
  description: string;
  icon: string;
  overview: string[];
  howItWorks: { step: number; title: string; description: string }[];
  keyConcepts: { title: string; description: string }[];
  applications: { title: string; description: string }[];
  summary: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number }[];
}

export const reproductiveExperiments: ReproductiveExperiment[] = [
  {
    id: "male-reproductive-system",
    title: "Male Reproductive System",
    description: "Explore the anatomy and function of the male reproductive organs including testes, epididymis, and vas deferens.",
    icon: "🔬",
    overview: [
      "The male reproductive system is responsible for producing, storing, and transporting sperm. This simulation allows you to explore each organ in detail using interactive 3D-style anatomy models.",
      "You can examine the testes (where sperm and testosterone are produced), the epididymis (where sperm matures and is stored), the vas deferens (which transports sperm), seminal vesicles and prostate gland (which produce semen fluids), and the urethra and penis.",
      "Interactive features include virtual dissection to peel away layers, animated sperm production and transport pathways, and hormone level controls to observe effects on the reproductive cycle."
    ],
    howItWorks: [
      { step: 1, title: "Observe the System", description: "View the complete male reproductive system with all organs labeled." },
      { step: 2, title: "Select an Organ", description: "Click on any organ to highlight it and view its name, function, and characteristics." },
      { step: 3, title: "Trace Sperm Pathway", description: "Follow the animated path of sperm from testes through epididymis, vas deferens, to urethra." },
      { step: 4, title: "Explore Microscopic View", description: "Toggle cellular view to see spermatogenesis and sperm maturation processes." },
      { step: 5, title: "Complete Labeling", description: "Drag and drop labels onto organs to test your identification skills." }
    ],
    keyConcepts: [
      { title: "Testes", description: "Male gonads that produce sperm (spermatogenesis) and secrete testosterone, the primary male sex hormone." },
      { title: "Epididymis", description: "Coiled tube attached to each testis where sperm cells mature and are stored until ejaculation." },
      { title: "Vas Deferens", description: "Muscular tube that transports mature sperm from the epididymis to the urethra during ejaculation." },
      { title: "Seminal Vesicles & Prostate", description: "Glands that secrete fluids forming semen, providing nutrients (fructose) and alkaline medium to protect sperm." },
      { title: "Urethra & Penis", description: "The urethra serves as a shared passage for urine and semen (at different times). The penis delivers semen into the female reproductive tract." },
      { title: "Spermatogenesis", description: "The process of sperm cell development in the seminiferous tubules of the testes, regulated by FSH and testosterone." }
    ],
    applications: [
      { title: "Reproductive Health", description: "Understanding male anatomy aids in diagnosing and treating conditions like infertility or testicular disorders." },
      { title: "Fertility Awareness", description: "Knowledge of sperm production helps in family planning and fertility management." },
      { title: "Medical Science", description: "Understanding anatomy informs surgical procedures and medical imaging interpretation." },
      { title: "Hormonal Health", description: "Testosterone's role in male development and its regulation by the hypothalamus-pituitary axis." },
      { title: "Education", description: "Visual and interactive learning enhances understanding and retention of reproductive biology." }
    ],
    summary: [
      "The testes produce sperm and testosterone through spermatogenesis.",
      "Sperm matures in the epididymis and is transported via the vas deferens.",
      "Seminal vesicles and prostate gland contribute fluids to form semen.",
      "The urethra serves as a shared passage for urine and semen at different times.",
      "Hormones FSH, LH, and testosterone regulate the male reproductive cycle."
    ],
    quizQuestions: [
      { question: "Where are sperm cells produced?", options: ["Epididymis", "Vas deferens", "Testes", "Prostate gland"], correctIndex: 2 },
      { question: "What is the function of the epididymis?", options: ["Produces testosterone", "Stores and matures sperm", "Transports urine", "Produces semen fluid"], correctIndex: 1 },
      { question: "Which structure transports sperm during ejaculation?", options: ["Urethra only", "Epididymis", "Vas deferens", "Seminal vesicle"], correctIndex: 2 },
      { question: "What do seminal vesicles secrete?", options: ["Testosterone", "Fructose-rich fluid for sperm", "Urine", "Eggs"], correctIndex: 1 },
      { question: "Which hormone is primarily produced by the testes?", options: ["Estrogen", "Progesterone", "Testosterone", "Insulin"], correctIndex: 2 }
    ]
  },
  {
    id: "female-reproductive-system",
    title: "Female Reproductive System",
    description: "Explore the anatomy and function of the female reproductive organs including ovaries, fallopian tubes, and uterus.",
    icon: "🔬",
    overview: [
      "The female reproductive system produces eggs, facilitates fertilization, and supports fetal development. This simulation allows you to explore each organ interactively.",
      "Examine the ovaries (where eggs and hormones are produced), fallopian tubes (where fertilization occurs), the uterus (where implantation and fetal development happen), the cervix, and the vagina.",
      "Interactive features include ovulation cycle animation, egg transport visualization, uterine lining changes throughout the menstrual cycle, and hormone level simulations."
    ],
    howItWorks: [
      { step: 1, title: "Observe the System", description: "View the complete female reproductive system with all organs labeled." },
      { step: 2, title: "Select an Organ", description: "Click on any organ to highlight it and view its name, function, and characteristics." },
      { step: 3, title: "Trace Egg Pathway", description: "Follow the animated path of an egg from ovary through fallopian tube to uterus." },
      { step: 4, title: "Simulate Menstrual Cycle", description: "Use the cycle day slider to observe changes in the uterine lining and hormone levels." },
      { step: 5, title: "Complete Labeling", description: "Drag and drop labels onto organs to test your identification skills." }
    ],
    keyConcepts: [
      { title: "Ovaries", description: "Female gonads that produce eggs (ova) through oogenesis and secrete hormones estrogen and progesterone." },
      { title: "Fallopian Tubes", description: "Tubes that transport the egg from ovary to uterus. Fertilization typically occurs here. Lined with cilia to move the egg." },
      { title: "Uterus", description: "A muscular organ where a fertilized egg implants and develops. The endometrium (lining) thickens each cycle to prepare for potential pregnancy." },
      { title: "Cervix", description: "The lower narrow end of the uterus that opens into the vagina. It acts as a gateway, protecting from infection and allowing sperm entry." },
      { title: "Vagina", description: "The muscular canal connecting the cervix to the outside. Serves as the birth canal and receives semen during intercourse." },
      { title: "Menstrual Cycle", description: "A ~28-day hormonal cycle with phases: menstruation, follicular phase, ovulation, and luteal phase. Regulated by FSH, LH, estrogen, and progesterone." }
    ],
    applications: [
      { title: "Reproductive Health", description: "Understanding female anatomy aids in diagnosing conditions like PCOS, endometriosis, and infertility." },
      { title: "Pregnancy & Childbirth", description: "Knowledge of the uterus and cervix is essential for understanding conception, prenatal development, and delivery." },
      { title: "Fertility Awareness", description: "Understanding ovulation and the menstrual cycle assists in family planning." },
      { title: "Medical Science", description: "Informs treatments, surgical planning, and medical imaging interpretation." },
      { title: "Hormonal Health", description: "Understanding estrogen and progesterone roles in the menstrual cycle and overall health." }
    ],
    summary: [
      "Ovaries produce eggs (ova) and secrete estrogen and progesterone.",
      "Fallopian tubes transport the egg and are the typical site of fertilization.",
      "The uterus provides the environment for implantation and fetal development.",
      "The menstrual cycle is a ~28-day hormonal cycle preparing the body for potential pregnancy.",
      "Hormones FSH, LH, estrogen, and progesterone regulate the female reproductive cycle."
    ],
    quizQuestions: [
      { question: "Where are eggs (ova) produced?", options: ["Uterus", "Fallopian tubes", "Ovaries", "Cervix"], correctIndex: 2 },
      { question: "Where does fertilization typically occur?", options: ["Uterus", "Ovary", "Vagina", "Fallopian tube"], correctIndex: 3 },
      { question: "What is the function of the uterus?", options: ["Produces eggs", "Site of implantation and fetal development", "Produces hormones only", "Filters blood"], correctIndex: 1 },
      { question: "What happens during ovulation?", options: ["Menstruation begins", "An egg is released from the ovary", "The uterine lining sheds", "Sperm is produced"], correctIndex: 1 },
      { question: "Which hormones regulate the menstrual cycle?", options: ["Insulin and glucagon", "FSH, LH, estrogen, and progesterone", "Adrenaline and cortisol", "Testosterone and DHT"], correctIndex: 1 }
    ]
  }
];
