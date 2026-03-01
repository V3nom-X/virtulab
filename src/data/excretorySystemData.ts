export interface ExcretoryExperiment {
  id: string;
  title: string;
  icon: string;
  description: string;
  overview: string[];
  howItWorks: { step: number; title: string; description: string }[];
  keyConcepts: { title: string; description: string }[];
  applications: { title: string; description: string }[];
  summary: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number }[];
}

export const excretoryExperiments: ExcretoryExperiment[] = [
  {
    id: "human-skin",
    title: "Parts of the Human Skin & Their Functions",
    icon: "🧴",
    description: "Explore the layered structure of human skin and its excretory role in thermoregulation through sweating.",
    overview: [
      "The skin is the largest organ of the human body and plays a vital role in excretion. It removes waste products such as water, salts, and small amounts of urea through sweat glands.",
      "The skin has three main layers: the epidermis (outer protective layer), dermis (contains sweat glands, blood vessels, nerve endings, and hair follicles), and the hypodermis (subcutaneous fat layer for insulation).",
      "Sweat glands in the dermis produce sweat, which is transported to the skin surface through sweat ducts. As sweat evaporates, it cools the body — a process called thermoregulation."
    ],
    howItWorks: [
      { step: 1, title: "Observe Skin Layers", description: "Explore the three main layers of the skin: epidermis, dermis, and hypodermis." },
      { step: 2, title: "Identify Structures", description: "Locate sweat glands, hair follicles, sebaceous glands, blood vessels, and nerve endings in the dermis." },
      { step: 3, title: "Simulate Sweating", description: "Increase the body temperature slider and observe sweat production from eccrine glands." },
      { step: 4, title: "Thermoregulation", description: "Watch how blood vessels dilate (vasodilation) to release heat, and sweat evaporates to cool the skin surface." },
      { step: 5, title: "Molecular View", description: "Toggle molecular view to see water, NaCl, and urea molecules in sweat." }
    ],
    keyConcepts: [
      { title: "Epidermis", description: "The outermost layer of skin providing a waterproof barrier and creating skin tone. It contains no blood vessels." },
      { title: "Dermis", description: "Contains tough connective tissue, hair follicles, sweat glands, blood vessels, and nerve endings." },
      { title: "Sweat Glands (Eccrine)", description: "Coiled tubular glands that produce sweat (water, NaCl, urea) for thermoregulation. Found all over the body." },
      { title: "Thermoregulation", description: "The process of maintaining a stable internal body temperature through sweating, vasodilation, and vasoconstriction." },
      { title: "Sebaceous Glands", description: "Produce sebum (oil) to lubricate and waterproof the skin and hair." }
    ],
    applications: [
      { title: "Body Temperature Control", description: "Sweating cools the body during exercise or hot weather through evaporative cooling." },
      { title: "Waste Removal", description: "The skin excretes small amounts of urea, salts, and water through perspiration." },
      { title: "Medical Diagnostics", description: "Sweat tests can diagnose conditions like cystic fibrosis by measuring salt concentration." },
      { title: "Skin Care Science", description: "Understanding skin layers helps develop treatments for acne, eczema, and wound healing." }
    ],
    summary: [
      "The skin has three layers: epidermis, dermis, and hypodermis.",
      "Sweat glands in the dermis produce sweat containing water, NaCl, and urea.",
      "Sweating is the primary mechanism for thermoregulation (cooling the body).",
      "Blood vessels dilate (vasodilation) in heat and constrict (vasoconstriction) in cold.",
      "The skin is both a protective barrier and an excretory organ."
    ],
    quizQuestions: [
      { question: "Which layer of the skin contains sweat glands?", options: ["Epidermis", "Dermis", "Hypodermis", "Stratum corneum"], correctIndex: 1 },
      { question: "What is the main function of sweating?", options: ["Digestion", "Thermoregulation", "Respiration", "Circulation"], correctIndex: 1 },
      { question: "What waste products are found in sweat?", options: ["Glucose and proteins", "Water, NaCl, and urea", "Oxygen and CO₂", "Fats and vitamins"], correctIndex: 1 },
      { question: "What happens to blood vessels when body temperature rises?", options: ["They constrict", "They dilate", "They disappear", "They thicken"], correctIndex: 1 }
    ]
  },
  {
    id: "urinary-system",
    title: "Parts of the Urinary System & Their Functions",
    icon: "🫘",
    description: "Trace the path of urine from the kidneys through ureters, bladder, and urethra.",
    overview: [
      "The urinary system is the primary excretory system in humans. It removes metabolic waste products (urea, creatinine, excess salts) from the blood and maintains water and electrolyte balance.",
      "The system consists of two kidneys, two ureters, a urinary bladder, and a urethra. The kidneys filter blood to produce urine, which travels through ureters to the bladder for storage before being expelled through the urethra.",
      "Each kidney receives blood through the renal artery and returns filtered blood through the renal vein. About 180 litres of blood are filtered daily, but only 1-2 litres become urine."
    ],
    howItWorks: [
      { step: 1, title: "Identify Organs", description: "Locate the kidneys, ureters, bladder, and urethra in the 3D model." },
      { step: 2, title: "Blood Supply", description: "Trace the renal artery bringing blood to the kidney and the renal vein returning filtered blood." },
      { step: 3, title: "Urine Formation", description: "Observe urine being produced in the kidneys through filtration." },
      { step: 4, title: "Transport", description: "Watch urine travel through the ureters via peristalsis to the bladder." },
      { step: 5, title: "Storage & Excretion", description: "See the bladder fill and urine expelled through the urethra." }
    ],
    keyConcepts: [
      { title: "Kidneys", description: "Bean-shaped organs that filter blood, remove waste, and regulate water/electrolyte balance. Located below the ribcage." },
      { title: "Ureters", description: "Muscular tubes (25-30 cm) that transport urine from each kidney to the bladder via peristaltic contractions." },
      { title: "Urinary Bladder", description: "A muscular sac that stores urine (capacity ~500 mL). The detrusor muscle contracts during urination." },
      { title: "Urethra", description: "The tube through which urine exits the body. Controlled by internal (involuntary) and external (voluntary) sphincters." },
      { title: "Renal Artery & Vein", description: "The renal artery brings unfiltered blood to the kidney; the renal vein carries filtered blood away." }
    ],
    applications: [
      { title: "Dialysis", description: "When kidneys fail, dialysis machines filter blood artificially, mimicking kidney function." },
      { title: "Kidney Transplants", description: "A healthy kidney from a donor can replace a failed kidney, restoring normal excretion." },
      { title: "Urine Analysis", description: "Testing urine can reveal diabetes (glucose), kidney disease (protein), and infections (bacteria)." },
      { title: "Hydration Science", description: "Understanding the urinary system helps explain why adequate water intake is essential for health." }
    ],
    summary: [
      "The urinary system consists of kidneys, ureters, bladder, and urethra.",
      "Kidneys filter blood to remove urea, excess salts, and water.",
      "Urine travels from kidneys → ureters → bladder → urethra.",
      "About 180L of blood is filtered daily, producing 1-2L of urine.",
      "The system maintains water balance and removes metabolic waste."
    ],
    quizQuestions: [
      { question: "What is the main function of the kidneys?", options: ["Pump blood", "Filter blood and produce urine", "Store urine", "Digest food"], correctIndex: 1 },
      { question: "How does urine travel from the kidney to the bladder?", options: ["Through veins", "Through ureters", "Through the urethra", "Through arteries"], correctIndex: 1 },
      { question: "How much blood do the kidneys filter per day?", options: ["1-2 litres", "10 litres", "About 180 litres", "500 mL"], correctIndex: 2 },
      { question: "What controls the release of urine from the bladder?", options: ["Kidneys", "Sphincter muscles", "Ureters", "Heart"], correctIndex: 1 }
    ]
  },
  {
    id: "human-kidney",
    title: "The Human Kidney",
    icon: "🔬",
    description: "Zoom into the kidney and nephron to understand filtration, reabsorption, and secretion.",
    overview: [
      "The kidney is the primary organ of excretion and homeostasis. Each kidney contains about 1 million microscopic functional units called nephrons, which filter blood and produce urine.",
      "A nephron consists of the Bowman's capsule (where blood is filtered), the proximal convoluted tubule (reabsorption of glucose, amino acids, salts), the Loop of Henle (water reabsorption and concentration), the distal convoluted tubule (secretion of H⁺ and K⁺), and the collecting duct (final water reabsorption under ADH control).",
      "The kidney has three main regions: the cortex (outer layer with glomeruli), the medulla (inner layer with loops of Henle and collecting ducts), and the renal pelvis (collects urine before it enters the ureter)."
    ],
    howItWorks: [
      { step: 1, title: "Kidney Cross-Section", description: "Explore the cortex, medulla, and renal pelvis of the kidney." },
      { step: 2, title: "Nephron Structure", description: "Zoom into a nephron and identify the Bowman's capsule, tubules, Loop of Henle, and collecting duct." },
      { step: 3, title: "Glomerular Filtration", description: "Watch blood enter the glomerulus under high pressure, forcing small molecules (water, glucose, urea, salts) into the Bowman's capsule." },
      { step: 4, title: "Tubular Reabsorption", description: "Observe useful substances (glucose, amino acids, most water) being reabsorbed back into the blood in the proximal tubule." },
      { step: 5, title: "Secretion & Concentration", description: "See how the distal tubule secretes extra H⁺ and K⁺, and the collecting duct concentrates urine under ADH control." }
    ],
    keyConcepts: [
      { title: "Nephron", description: "The functional unit of the kidney. Each kidney has ~1 million nephrons that filter blood and produce urine." },
      { title: "Glomerular Filtration", description: "Blood is filtered in the glomerulus (a knot of capillaries) under high pressure. Small molecules pass into Bowman's capsule." },
      { title: "Tubular Reabsorption", description: "Useful substances like glucose, amino acids, and most water are reabsorbed from the filtrate back into the blood." },
      { title: "Loop of Henle", description: "Creates a concentration gradient in the medulla, allowing water to be reabsorbed and urine to be concentrated." },
      { title: "ADH (Antidiuretic Hormone)", description: "Controls water reabsorption in the collecting duct. More ADH = more water reabsorbed = concentrated urine." },
      { title: "Cortex & Medulla", description: "Cortex: outer region with glomeruli and convoluted tubules. Medulla: inner region with loops of Henle and collecting ducts." }
    ],
    applications: [
      { title: "Kidney Disease", description: "Damage to nephrons reduces filtration capacity, leading to waste buildup and kidney failure." },
      { title: "Diabetes Detection", description: "If glucose appears in urine, it indicates the kidneys can't reabsorb all filtered glucose (sign of diabetes)." },
      { title: "ADH & Dehydration", description: "When dehydrated, ADH levels rise, making collecting ducts more permeable to water, producing concentrated urine." },
      { title: "Dialysis", description: "Artificial filtration replicates nephron function when kidneys fail, using a semi-permeable membrane." }
    ],
    summary: [
      "Each kidney contains ~1 million nephrons (functional units).",
      "Nephrons perform filtration (glomerulus), reabsorption (tubules), and secretion (distal tubule).",
      "The Loop of Henle concentrates urine by creating an osmotic gradient.",
      "ADH controls water reabsorption in the collecting duct.",
      "The kidney maintains homeostasis by regulating water, salts, pH, and waste removal."
    ],
    quizQuestions: [
      { question: "What is the functional unit of the kidney?", options: ["Glomerulus", "Nephron", "Bowman's capsule", "Collecting duct"], correctIndex: 1 },
      { question: "Where does glomerular filtration occur?", options: ["Loop of Henle", "Collecting duct", "Bowman's capsule", "Ureter"], correctIndex: 2 },
      { question: "What does ADH control?", options: ["Blood pressure", "Water reabsorption in collecting duct", "Glucose absorption", "Urea production"], correctIndex: 1 },
      { question: "What is reabsorbed in the proximal convoluted tubule?", options: ["Only water", "Glucose, amino acids, and water", "Urea and salts", "Red blood cells"], correctIndex: 1 }
    ]
  }
];
