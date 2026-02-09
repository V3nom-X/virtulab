import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronRight, Atom, FlaskConical, Dna, Globe } from "lucide-react";

interface Topic {
  title: string;
  notes: string[];
}

interface Subject {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  topics: Topic[];
}

const gradeData: Record<string, Subject[]> = {
  "7": [
    {
      name: "Natural Sciences", icon: Atom,
      topics: [
        { title: "Introduction to Science", notes: ["Scientific method: observe, hypothesise, experiment, conclude", "Lab safety rules: goggles, no eating, tie hair back", "Measuring instruments: ruler, thermometer, scale, measuring cylinder", "Recording data in tables and drawing bar graphs"] },
        { title: "Matter and Materials", notes: ["Three states of matter: solid, liquid, gas", "Properties: shape, volume, compressibility", "Particle model explains behaviour of matter", "Heating and cooling cause changes of state", "Melting, boiling, freezing, condensation, evaporation"] },
        { title: "Energy and Change", notes: ["Sources of energy: sun, food, fuel, electricity", "Energy transfer and transformation", "Heat transfer: conduction, convection, radiation", "Insulators and conductors of heat"] },
        { title: "Life and Living", notes: ["Cells: basic unit of life", "Plant vs animal cells", "Cell organelles: nucleus, membrane, cytoplasm, cell wall, chloroplast", "Unicellular vs multicellular organisms", "Classification of living things into groups"] },
        { title: "Earth and Beyond", notes: ["The solar system: planets, sun, moons", "Earth's rotation (day/night) and revolution (seasons)", "Phases of the moon", "Atmosphere layers and weather basics"] },
      ]
    },
  ],
  "8": [
    {
      name: "Natural Sciences", icon: FlaskConical,
      topics: [
        { title: "Atoms and Elements", notes: ["Atoms are the building blocks of matter", "Element = pure substance of one type of atom", "Periodic Table organises elements by properties", "Groups (columns) and periods (rows)", "Metals, non-metals, and metalloids"] },
        { title: "Compounds and Chemical Reactions", notes: ["Compounds form when elements react chemically", "Chemical formula shows types and numbers of atoms", "Word equations and balanced symbol equations", "Synthesis, decomposition, and displacement reactions", "Conservation of mass in reactions"] },
        { title: "Particle Model of Matter", notes: ["Particles in solids vibrate in fixed positions", "Particles in liquids slide past each other", "Particles in gases move freely at high speed", "Diffusion: movement from high to low concentration", "Brownian motion as evidence for particle theory"] },
        { title: "Photosynthesis and Respiration", notes: ["Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", "Requires sunlight and chlorophyll", "Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy", "Aerobic vs anaerobic respiration", "Relationship between photosynthesis and respiration"] },
        { title: "Ecosystems", notes: ["Biotic (living) and abiotic (non-living) factors", "Food chains and food webs", "Producers, consumers, decomposers", "Energy flow through trophic levels", "Human impact on ecosystems"] },
        { title: "Forces and Pressure", notes: ["Contact and non-contact forces", "Balanced and unbalanced forces", "Friction: opposing motion between surfaces", "Pressure = Force ÷ Area", "Atmospheric and hydraulic pressure"] },
      ]
    },
  ],
  "9": [
    {
      name: "Natural Sciences", icon: Dna,
      topics: [
        { title: "Cells and Cell Division", notes: ["Review of cell structure and organelles", "Mitosis: growth and repair (identical daughter cells)", "Stages: prophase, metaphase, anaphase, telophase", "Meiosis: produces sex cells (gametes) with half chromosomes", "Importance of cell division in growth and reproduction"] },
        { title: "Systems in the Human Body", notes: ["Digestive system: ingestion → digestion → absorption → egestion", "Circulatory system: heart, blood vessels, blood", "Respiratory system: lungs, gas exchange", "Nervous system: brain, spinal cord, nerves, reflexes", "Excretory system: kidneys filter waste from blood"] },
        { title: "Atoms and the Periodic Table", notes: ["Atomic number = protons; mass number = protons + neutrons", "Electron configuration and energy levels", "Ions: atoms that gain or lose electrons", "Isotopes: same element, different neutrons", "Trends in the Periodic Table: reactivity, atomic radius"] },
        { title: "Chemical Bonding", notes: ["Ionic bonding: transfer of electrons (metals + non-metals)", "Covalent bonding: sharing of electrons (non-metals)", "Properties of ionic compounds: high melting point, conduct when dissolved", "Properties of covalent compounds: low melting point, poor conductors", "Drawing Lewis dot diagrams"] },
        { title: "Reactions and Equations", notes: ["Acids + metals → salt + hydrogen", "Acids + bases → salt + water (neutralisation)", "Acids + carbonates → salt + water + CO₂", "pH scale: 0–14 (acid–neutral–base)", "Indicators: litmus, universal, phenolphthalein"] },
        { title: "Electricity and Magnetism", notes: ["Electric circuits: series and parallel", "Ohm's Law: V = IR", "Resistors, switches, bulbs in circuits", "Magnets: poles, magnetic fields", "Electromagnets and their applications"] },
        { title: "Forces and Motion", notes: ["Speed = distance ÷ time", "Velocity includes direction", "Acceleration = change in velocity ÷ time", "Newton's three laws of motion", "Gravity and weight vs mass"] },
        { title: "Earth's History and Resources", notes: ["Fossils and geological time scale", "Sedimentary, igneous, metamorphic rocks", "Rock cycle: weathering, erosion, deposition", "Natural resources: renewable vs non-renewable", "Mining and environmental impact in South Africa"] },
      ]
    },
  ],
};

const GeniusBar = () => {
  const [openTopics, setOpenTopics] = useState<string[]>([]);

  const toggleTopic = (key: string) => {
    setOpenTopics(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <section className="py-12 border-b bg-muted/30">
          <div className="container px-4">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 text-gold" />
              <h1 className="text-3xl md:text-4xl font-bold">Genius Bar</h1>
            </div>
            <p className="text-muted-foreground">Curriculum notes for Grade 7–9 Natural Sciences</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4">
            <Tabs defaultValue="7">
              <TabsList className="mb-6">
                <TabsTrigger value="7" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Grade 7</TabsTrigger>
                <TabsTrigger value="8" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Grade 8</TabsTrigger>
                <TabsTrigger value="9" className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">Grade 9</TabsTrigger>
              </TabsList>

              {Object.entries(gradeData).map(([grade, subjects]) => (
                <TabsContent key={grade} value={grade}>
                  <div className="space-y-6">
                    {subjects.map((subject) => (
                      <Card key={subject.name}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <subject.icon className="w-5 h-5 text-primary" />
                            {subject.name}
                            <Badge variant="secondary" className="ml-auto">Grade {grade}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {subject.topics.map((topic, idx) => {
                            const key = `${grade}-${subject.name}-${idx}`;
                            const isOpen = openTopics.includes(key);
                            return (
                              <Collapsible key={key} open={isOpen} onOpenChange={() => toggleTopic(key)}>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-between h-auto py-3 px-3 hover:bg-muted/50">
                                    <span className="text-sm font-medium text-left">{topic.title}</span>
                                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="px-3 pb-3">
                                  <ul className="space-y-1.5 pt-2">
                                    {topic.notes.map((note, nIdx) => (
                                      <li key={nIdx} className="flex gap-2 text-sm text-muted-foreground">
                                        <span className="text-primary mt-1">•</span>
                                        <span>{note}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GeniusBar;
