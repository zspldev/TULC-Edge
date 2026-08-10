export type Subject = 'science' | 'maths';

export interface Chapter {
  id: string;
  number: number;
  title: string;
  marathiTitle: string;
  context: string; // Placeholder curriculum context until real RAG is connected
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
      {
        id: 'sci-1',
        number: 1,
        title: 'Measurement and Effects of Heat',
        marathiTitle: 'उष्णतेचे मापन आणि परिणाम',
        context: `Chapter 1: Measurement and Effects of Heat
Heat is a form of energy that flows from a hotter body to a cooler body. Temperature is measured using a thermometer in Celsius (°C) or Fahrenheit (°F). The SI unit of heat is the Joule (J), and the calorie is a common unit (1 calorie = 4.18 J).
Effects of heat: (1) Expansion - solids, liquids, and gases expand on heating. Gases expand the most, solids the least. (2) Change of state - ice (solid) → water (liquid) at 0°C; water (liquid) → steam (gas) at 100°C. These are called melting point and boiling point. (3) Temperature change - heating increases temperature; cooling decreases it.
Transfer of heat occurs by three methods: Conduction (through solids, e.g., metal rod), Convection (through liquids and gases, e.g., water heating), and Radiation (without any medium, e.g., Sun's heat reaching Earth).
Good conductors of heat: metals like copper, iron, aluminium. Poor conductors (insulators): wood, plastic, rubber, glass, wool.
Specific heat capacity: the amount of heat needed to raise the temperature of 1 kg of a substance by 1°C. Water has a high specific heat capacity (4200 J/kg°C), which is why it is used as a coolant.
The latent heat of fusion is the heat needed to change a solid to liquid without temperature change. The latent heat of vaporisation is the heat needed to change a liquid to vapour.`,
      },
      {
        id: 'sci-2',
        number: 2,
        title: 'Reflection of Light',
        marathiTitle: 'प्रकाशाचे परावर्तन',
        context: `Chapter 2: Reflection of Light
Light travels in straight lines at a speed of approximately 3 × 10^8 m/s (3,00,000 km/s) in vacuum.
Laws of Reflection: (1) The angle of incidence equals the angle of reflection (∠i = ∠r). (2) The incident ray, reflected ray, and normal at the point of incidence all lie in the same plane. These angles are measured from the normal (perpendicular to the surface at the point of incidence).
Types of mirrors and image formation:
- Plane mirror: Image is virtual (cannot be caught on screen), erect (upright), same size as object, and formed as far behind the mirror as the object is in front. The image is laterally inverted (left-right reversed).
- Concave mirror (converging mirror): Curves inward. Can form real, inverted, and magnified images (when object is between F and C), real and same-size image (when object is at C), real and diminished image (when object is beyond C), and virtual, erect, magnified image (when object is between F and mirror). Used in torches, headlights, shaving mirrors, doctor's mirrors.
- Convex mirror (diverging mirror): Curves outward. Always forms virtual, erect, and diminished images. Used as rear-view mirrors in vehicles because it provides a wide field of view.
Key terms: Principal axis, Centre of curvature (C), Radius of curvature (R), Principal focus (F), Focal length (f = R/2).
Refraction: Light bends when it passes from one medium to another. This is called refraction. Examples: pencil in water looks bent, stars twinkle.`,
      },
      {
        id: 'sci-3',
        number: 3,
        title: 'Man-made Materials',
        marathiTitle: 'मानवनिर्मित पदार्थ',
        context: `Chapter 3: Man-made Materials (Synthetic Fibres and Plastics)
Synthetic fibres are man-made fibres produced from petrochemicals (crude oil). They are stronger, more durable, and less expensive than natural fibres.
Types of synthetic fibres:
- Rayon (artificial silk): Made from cellulose (wood pulp). Has properties similar to silk but is less expensive. Also called viscose.
- Nylon: First fully synthetic fibre. Very strong, elastic, lightweight, resistant to heat and chemicals. Used in toothbrushes, ropes, parachutes, socks.
- Polyester (PET): Resistant to wrinkles, moisture, chemicals. Used in clothing (Terylene), bottles, films.
- Acrylic (artificial wool): Lightweight, warm, retains shape. Used as a substitute for wool in sweaters, blankets.
Disadvantages of synthetic fibres: they melt and stick to skin when burned (fire hazard), do not absorb sweat well (uncomfortable in hot weather), and are non-biodegradable (cause pollution).
Plastics: Polymers made from petroleum. Two types:
- Thermoplastics: Can be remoulded on reheating (e.g., PVC, polythene). Used in toys, combs, containers.
- Thermosetting plastics: Cannot be remoulded once set (e.g., Bakelite, melamine). Used in electrical switches, cookware handles.
Properties of plastics: lightweight, strong, durable, corrosion-resistant, poor conductors of heat and electricity.
Environmental problems: Plastics are non-biodegradable. They remain in soil and water for hundreds of years, harming animals and ecosystems. The 4Rs: Reduce, Reuse, Recycle, Recover.`,
      },
      {
        id: 'sci-4',
        number: 4,
        title: 'Current Electricity and Magnetism',
        marathiTitle: 'विद्युत प्रवाह आणि चुंबकत्व',
        context: `Chapter 4: Current Electricity and Magnetism
Electric circuit: A closed path through which electric current (flow of electrons) flows. Components: cell/battery (EMF source), connecting wires, switch, bulb/resistor.
Ohm's Law: V = IR, where V = voltage (volts), I = current (amperes), R = resistance (ohms). Resistance opposes the flow of current.
Series circuit: Components connected end-to-end. Same current flows through all. Total resistance = R1 + R2 + R3. If one bulb fuses, all go off.
Parallel circuit: Components connected across the same two points. Same voltage across all. Total resistance is less than the smallest individual resistance. If one bulb fuses, others remain on. Used in household wiring.
Heating effect of current: When current flows through a conductor, heat is produced (Joule heating). Used in electric heaters, toasters, electric iron, incandescent bulbs.
Magnetic effect of current (Electromagnetism): When current flows through a wire, it produces a magnetic field around it. A coil of wire carrying current (solenoid) acts like a bar magnet. An electromagnet is a temporary magnet created by passing current through a wire coiled around a soft iron core. Used in electric bells, cranes, motors, MRI machines.
Fuse: A safety device made of a wire with low melting point. It melts and breaks the circuit when excess current flows, protecting appliances. MCB (Miniature Circuit Breaker) is the modern alternative.`,
      },
      {
        id: 'sci-5',
        number: 5,
        title: 'Inside the Atom',
        marathiTitle: 'अणूची अंतर्रचना',
        context: `Chapter 5: Inside the Atom
An atom is the smallest particle of an element that retains the chemical properties of that element. Atoms are composed of subatomic particles.
Subatomic particles:
- Proton: Positively charged (+1). Located in the nucleus. Mass = 1 amu.
- Neutron: No charge (neutral). Located in the nucleus. Mass = 1 amu.
- Electron: Negatively charged (-1). Located in shells/orbits around the nucleus. Mass = negligible (1/1836 of proton).
Atomic number (Z): Number of protons in the nucleus. It defines the element. In a neutral atom, number of electrons = number of protons.
Mass number (A): Total number of protons + neutrons in the nucleus.
Number of neutrons = A - Z.
Electron shells (energy levels): Electrons are arranged in shells K, L, M, N... Maximum electrons: K=2, L=8, M=18. Valence electrons are in the outermost shell.
Ions: Atoms that gain or lose electrons become ions. Atoms that lose electrons become positive ions (cations). Atoms that gain electrons become negative ions (anions).
Isotopes: Atoms of the same element with the same atomic number but different mass numbers (different number of neutrons). Example: Hydrogen has three isotopes: Protium (1H), Deuterium (2H), Tritium (3H).
Atomic models: Thomson's plum pudding model, Rutherford's nuclear model (gold foil experiment), Bohr's model (electrons in fixed orbits/shells).`,
      },
      {
        id: 'sci-6',
        number: 6,
        title: 'Composition of Matter',
        marathiTitle: 'पदार्थांची रचना',
        context: `Chapter 6: Composition of Matter
Matter is anything that has mass and occupies space. Matter is classified as:
Elements: Pure substances made of only one type of atom. Cannot be broken down further by chemical methods. Examples: hydrogen (H), oxygen (O), gold (Au), iron (Fe). There are 118 elements in the periodic table.
Compounds: Pure substances made of two or more elements chemically combined in a fixed ratio. Have properties different from constituent elements. Can be broken down by chemical methods. Examples: water (H₂O), salt (NaCl), sugar (C₁₂H₂₂O₁₁).
Mixtures: Made of two or more substances mixed together (not chemically combined). Components retain their own properties. Can be separated by physical methods. Variable composition.
- Homogeneous mixtures (solutions): uniform composition throughout. Example: salt water, air, brass.
- Heterogeneous mixtures: non-uniform composition. Example: soil, granite, salad.
Separation methods:
- Filtration: separates insoluble solid from liquid (sand from water)
- Evaporation: separates dissolved solid from liquid (salt from salt water)
- Distillation: separates liquids with different boiling points
- Chromatography: separates dyes or pigments
- Magnetic separation: separates magnetic materials from non-magnetic
- Centrifugation: separates components based on density (used in milk to separate cream)
Physical changes: temporary, reversible, no new substance formed (melting ice, tearing paper).
Chemical changes: permanent, irreversible, new substance formed with different properties (burning, rusting, cooking).`,
      },
      {
        id: 'sci-7',
        number: 7,
        title: 'Metals and Nonmetals',
        marathiTitle: 'धातू आणि अधातू',
        context: `Chapter 7: Metals and Nonmetals
Metals: Elements that are lustrous (shiny), malleable (can be beaten into sheets), ductile (can be drawn into wires), good conductors of heat and electricity, and produce a ringing sound when struck (sonorous). Examples: iron, copper, gold, silver, aluminium.
Nonmetals: Usually dull, brittle (break easily), poor conductors of heat and electricity. Examples: carbon, sulphur, oxygen, nitrogen, iodine.
Exceptions: Graphite (carbon) is a good conductor. Mercury (metal) is liquid at room temperature. Sodium and potassium (metals) are soft.
Physical properties comparison:
- State at room temperature: Metals are solid (except mercury); nonmetals can be solid, liquid, or gas.
- Density: Metals are generally dense; nonmetals less so.
Chemical properties:
- Reaction with oxygen: Metals form basic oxides (CuO, Fe₂O₃). Nonmetals form acidic oxides (CO₂, SO₂).
- Reaction with water: Sodium reacts vigorously with cold water; iron reacts slowly with steam; copper does not react.
- Reaction with acids: Metals react with dilute acids to produce salt + hydrogen gas. Nonmetals generally don't react.
Reactivity series (most to least reactive): K, Na, Ca, Mg, Al, Zn, Fe, Pb, H, Cu, Hg, Ag, Au.
Corrosion: Slow deterioration of metals due to chemical reactions. Rusting of iron: Fe + O₂ + H₂O → Fe₂O₃.xH₂O (iron oxide). Prevention: painting, galvanizing (coating with zinc), alloying, electroplating.
Alloys: Mixtures of metals (or metal + nonmetal). Steel (Fe + C), brass (Cu + Zn), bronze (Cu + Sn).`,
      },
      {
        id: 'sci-8',
        number: 8,
        title: 'Pollution',
        marathiTitle: 'प्रदूषण',
        context: `Chapter 8: Pollution
Pollution is the introduction of harmful substances or energy into the environment, causing adverse effects. A pollutant is any substance that causes pollution.
Air Pollution: Contamination of air with harmful gases and particles.
Causes: Burning of fossil fuels (vehicles, factories), industrial emissions (SO₂, NO₂), deforestation, burning of garbage, agricultural activities.
Effects: Respiratory diseases (asthma, bronchitis), acid rain (sulphuric acid + nitric acid dissolved in rainwater, damages buildings and forests), greenhouse effect and global warming (CO₂, methane trap heat), smog (smoke + fog).
Water Pollution: Contamination of water bodies.
Causes: Industrial effluents (chemicals, heavy metals), agricultural runoff (pesticides, fertilizers), sewage and domestic waste, oil spills.
Effects: Death of aquatic life, spread of diseases (cholera, typhoid), eutrophication (excess nutrients cause algal bloom, depletes oxygen).
Soil Pollution: Degradation of land quality.
Causes: Pesticides and chemical fertilizers, industrial waste, plastic and solid waste dumping, mining.
Effects: Reduced soil fertility, groundwater contamination, affects food chain.
Noise Pollution: Excessive or unwanted sound.
Causes: Vehicles, industrial machines, loudspeakers, construction.
Effects: Hearing damage, stress, sleep disturbance.
Prevention and solutions: Use of renewable energy, proper waste management, sewage treatment plants, organic farming, recycling, reducing use of plastic, afforestation (planting trees), catalytic converters in vehicles.`,
      },
      {
        id: 'sci-9',
        number: 9,
        title: 'Disaster Management',
        marathiTitle: 'आपत्ती व्यवस्थापन',
        context: `Chapter 9: Disaster Management
A disaster is a sudden event that causes widespread destruction, suffering, or loss of life. Types: Natural disasters (earthquakes, floods, cyclones, droughts, landslides, tsunamis) and Man-made disasters (fires, industrial accidents, chemical spills, oil spills, nuclear accidents).
Earthquake: Sudden shaking of Earth's surface due to movement of tectonic plates. Measured on the Richter scale. Focus (hypocenter) is the point of origin inside Earth; Epicenter is the point on the surface directly above the focus. Seismograph is the instrument used to measure earthquakes. Dos: take shelter under a strong table, stay away from windows. Don'ts: don't use lifts, don't panic.
Flood: Overflow of water onto normally dry land. Causes: heavy rainfall, overflowing rivers, dam failure. Prevention: embankments, proper drainage, afforestation.
Cyclone: Violent rotating storm with strong winds and heavy rain, forming over warm ocean waters. Accompanied by storm surge (rise in sea level). Alert systems: colour-coded warnings (green, yellow, orange, red).
Drought: Prolonged period of below-average precipitation. Causes: irregular rainfall, deforestation. Mitigation: water conservation, rainwater harvesting, drought-resistant crops.
Disaster Management cycle: Prevention → Preparedness → Response → Recovery.
First aid basics: DRABC (Danger, Response, Airway, Breathing, Circulation). CPR basics. Stop bleeding by applying pressure. Treatment for burns: cool running water for 10 minutes.
Mock drills and awareness: Schools should conduct regular earthquake and fire drills. Keep emergency kit ready (water, food, first-aid, torch, radio).`,
      },
      {
        id: 'sci-10',
        number: 10,
        title: 'Cell and Cell Organelles',
        marathiTitle: 'पेशी आणि पेशीांगे',
        context: `Chapter 10: Cell and Cell Organelles
A cell is the basic structural and functional unit of all living organisms. Robert Hooke first observed cells in 1665. Cell theory (Schleiden, Schwann, Virchow): All living things are made of cells; the cell is the basic unit of life; all cells arise from pre-existing cells.
Cell types: Prokaryotic (no true nucleus; membrane-bound organelles absent; e.g., bacteria) and Eukaryotic (true nucleus with nuclear membrane; membrane-bound organelles present; e.g., plant cells, animal cells, fungi).
Plant cell vs Animal cell:
Plant cell has: cell wall (made of cellulose), large central vacuole, chloroplasts (for photosynthesis), fixed shape.
Animal cell has: cell membrane only (no cell wall), small vacuoles, no chloroplasts, irregular shape, centrioles (for cell division).
Common organelles:
- Cell membrane: Selectively permeable boundary that controls what enters and exits the cell.
- Nucleus: Control centre of the cell. Contains DNA (genetic material). Nucleolus is inside the nucleus. Nuclear membrane surrounds it.
- Mitochondria: "Powerhouse of the cell." Site of cellular respiration. Produces energy (ATP).
- Chloroplast: Found in plant cells. Contains chlorophyll. Site of photosynthesis. Traps sunlight to produce food.
- Endoplasmic Reticulum (ER): Network of membranes. Rough ER (with ribosomes) makes proteins; Smooth ER makes lipids.
- Ribosome: Site of protein synthesis. Found on rough ER and free in cytoplasm.
- Golgi Body (Golgi Apparatus): Packages and transports proteins. "Post office" of the cell.
- Vacuole: Storage organelle. Large in plant cells (stores water, maintains turgor pressure). Small in animal cells.
- Lysosome: Contains digestive enzymes. Destroys old organelles and foreign particles ("suicide bags").`,
      },
      {
        id: 'sci-11',
        number: 11,
        title: 'Human Body and Organ System',
        marathiTitle: 'मानवी शरीर आणि इंद्रिय संस्था',
        context: `Chapter 11: Human Body and Organ System
The human body has several organ systems that work together to maintain life.
Digestive System: Breaks down food into simpler molecules for absorption.
Path: Mouth (teeth chew, saliva contains amylase enzyme) → Oesophagus (food pipe, peristalsis moves food down) → Stomach (gastric juice with pepsin and HCl, churns food) → Small intestine (bile from liver, enzymes from pancreas complete digestion; villi absorb nutrients into blood) → Large intestine (absorbs water, forms faeces) → Rectum → Anus. Liver produces bile (emulsifies fats). Pancreas produces pancreatic juice (contains amylase, lipase, trypsin).
Respiratory System: Exchanges gases (O₂ in, CO₂ out).
Path: Nostrils → Trachea (windpipe) → Bronchi → Lungs → Bronchioles → Alveoli (tiny air sacs with thin walls and many capillaries; gas exchange happens here by diffusion). Diaphragm and intercostal muscles control breathing.
Circulatory System: Transports blood, nutrients, oxygen, and waste.
Heart: 4 chambers (right atrium, right ventricle, left atrium, left ventricle). Right side pumps deoxygenated blood to lungs (pulmonary circulation). Left side pumps oxygenated blood to body (systemic circulation). Heart rate: ~72 beats/min.
Blood vessels: Arteries (carry blood away from heart, thick walls, high pressure), Veins (carry blood to heart, have valves), Capillaries (single-cell thick, gas/nutrient exchange).
Blood: Plasma (55%, carries dissolved substances), Red blood cells (carry O₂ using haemoglobin), White blood cells (fight infection, immunity), Platelets (blood clotting).
Excretory System: Removes metabolic waste from the body.
Kidneys filter blood to produce urine (water, urea, salts). Each kidney contains about 1 million nephrons (functional units). Urine flows: Kidney → Ureter → Urinary bladder → Urethra.`,
      },
      {
        id: 'sci-12',
        number: 12,
        title: 'Introduction to Acid and Base',
        marathiTitle: 'आम्ल व आम्लारि ओळख',
        context: `Chapter 12: Introduction to Acid and Base
Acids: Substances that taste sour, turn blue litmus red, have pH less than 7. Contain hydrogen and release H⁺ ions in water. Examples: Hydrochloric acid (HCl), Sulphuric acid (H₂SO₄), Acetic acid (CH₃COOH, found in vinegar), Citric acid (lemon).
Bases: Substances that taste bitter, feel soapy, turn red litmus blue, have pH greater than 7. Release OH⁻ ions in water. Soluble bases are called alkalis. Examples: Sodium hydroxide (NaOH), Calcium hydroxide (Ca(OH)₂ - lime water), Ammonia solution (NH₄OH), Baking soda (NaHCO₃).
pH Scale: Measures acidity or basicity from 0 to 14. pH 7 = neutral (pure water). pH < 7 = acidic. pH > 7 = basic (alkaline). Strong acids have very low pH (0-2); strong bases have very high pH (12-14).
Indicators: Substances that change colour in acids and bases.
- Litmus: Natural indicator from lichen. Red in acid, blue in base.
- Phenolphthalein: Colourless in acid, pink in base.
- Methyl orange: Red in acid, yellow in base.
- Universal indicator: Shows a range of colours for different pH values.
Neutralisation: When an acid and a base react, they cancel each other's properties, forming a salt and water. Acid + Base → Salt + Water. Example: HCl + NaOH → NaCl + H₂O. This is an exothermic reaction (releases heat).
Everyday examples: Antacids (bases) neutralise excess stomach acid; baking soda (base) used for bee stings (acidic); vinegar (acid) removes lime scale (basic).`,
      },
      {
        id: 'sci-13',
        number: 13,
        title: 'Chemical Change and Chemical Bond',
        marathiTitle: 'रासायनिक अभिक्रिया आणि रासायनिक बंध',
        context: `Chapter 13: Chemical Change and Chemical Bond
Chemical change: A change in which new substances with new properties are formed. Characteristics: new substance formed, change in colour, production of gas, change in temperature, irreversible. Examples: burning, rusting, cooking, digestion.
Types of chemical reactions:
1. Combination (Synthesis): A + B → AB. Example: C + O₂ → CO₂ (carbon burns in oxygen)
2. Decomposition: AB → A + B. Example: CaCO₃ → CaO + CO₂ (heating limestone)
3. Displacement: A + BC → AC + B (more reactive A displaces less reactive B). Example: Fe + CuSO₄ → FeSO₄ + Cu
4. Double Displacement: AB + CD → AD + CB. Example: AgNO₃ + NaCl → AgCl + NaNO₃
5. Oxidation-Reduction (Redox): Oxidation = loss of electrons (gain of oxygen). Reduction = gain of electrons (loss of oxygen). These always occur together.
Chemical Bond: Force of attraction that holds atoms together in a molecule.
Ionic Bond: Transfer of electrons from one atom to another. Metal + Nonmetal. The atom that loses electrons becomes a positive ion (cation); the atom that gains electrons becomes a negative ion (anion). Example: NaCl (sodium chloride). Strong bond; high melting point; conducts electricity in molten or dissolved state.
Covalent Bond: Sharing of electrons between two atoms. Nonmetal + Nonmetal. Example: H₂O, CO₂, CH₄. Can be single (H-H), double (O=O), or triple (N≡N) bonds. Generally lower melting points than ionic compounds.`,
      },
      {
        id: 'sci-14',
        number: 14,
        title: 'Properties of a Magnetic Field',
        marathiTitle: 'चुंबकीय क्षेत्राचे गुणधर्म',
        context: `Chapter 14: Properties of a Magnetic Field
A magnet is a material that attracts iron, nickel, cobalt, and their alloys. Every magnet has two poles: North pole and South pole. Like poles repel; unlike poles attract.
Magnetic field: The region around a magnet where magnetic force can be experienced. Represented by magnetic field lines (also called lines of force).
Properties of magnetic field lines:
1. They emerge from the North pole and enter the South pole outside the magnet.
2. They are continuous closed curves (inside the magnet, they go from South to North).
3. They never intersect each other.
4. Where field lines are closer together, the field is stronger (near the poles).
5. The tangent to a field line at any point gives the direction of the magnetic field at that point.
Earth's Magnetic Field (Geomagnetism): Earth behaves like a giant magnet. The geographic North pole of Earth is actually near the magnetic South pole (which is why the North pole of a compass needle points North). Earth's magnetic field extends far into space.
Magnetic compass: A small magnetised needle that freely rotates and aligns itself with Earth's magnetic field, pointing North-South. Used for navigation.
Electromagnetism (review): A current-carrying conductor produces a magnetic field. The direction is given by the Right-hand thumb rule (thumb points in direction of current, curled fingers show field direction). An electromagnet is stronger when: more current, more turns of wire, soft iron core is used.
Applications of magnets: Electric motors, generators, loudspeakers, MRI machines, magnetic storage (hard drives), maglev trains.`,
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
      {
        id: 'math-1',
        number: 1,
        title: 'Rational and Irrational Numbers',
        marathiTitle: 'परिमेय आणि अपरिमेय संख्या',
        context: `Chapter 1: Rational and Irrational Numbers
Rational Numbers: Numbers that can be expressed in the form p/q, where p and q are integers and q ≠ 0. Examples: 1/2, -3/4, 5, 0, 0.75 (= 3/4), 0.333... (= 1/3).
Characteristics: Their decimal expansion is either terminating (e.g., 3/4 = 0.75) or non-terminating repeating (e.g., 1/3 = 0.333...).
Irrational Numbers: Numbers that CANNOT be expressed in the form p/q. Their decimal expansion is non-terminating and non-repeating (no pattern). Examples: √2 = 1.41421356..., √3, √5, π = 3.14159..., e = 2.71828...
Proof that √2 is irrational: Assume √2 = p/q in lowest terms. Then 2 = p²/q², so p² = 2q². This means p² is even, so p is even. Write p = 2m, then 4m² = 2q², so q² = 2m², meaning q is also even. But this contradicts p/q being in lowest terms. So √2 is irrational.
Real Numbers: All rational numbers together with all irrational numbers form the set of Real Numbers. Every point on the number line represents a real number, and every real number corresponds to a point on the number line.
Representing irrational numbers on the number line: For √2, draw a right triangle with legs of length 1, hypotenuse = √2. Use compass to mark √2 on the number line.
Operations: Rational + Rational = Rational. Rational × Irrational = Irrational (if rational ≠ 0). Irrational + Irrational can be rational (√2 + (-√2) = 0) or irrational. √a × √b = √(ab).`,
      },
      {
        id: 'math-2',
        number: 2,
        title: 'Parallel Lines and Transversals',
        marathiTitle: 'समांतर रेषा आणि छेदक',
        context: `Chapter 2: Parallel Lines and Transversals
Parallel lines: Two lines in the same plane that never intersect, no matter how far extended. Written as l ∥ m. Distance between parallel lines is always constant.
Transversal: A line that intersects two or more lines at distinct points.
When a transversal cuts two parallel lines, it forms 8 angles. These angles have special relationships:
1. Corresponding angles: In the same position at each intersection. They are EQUAL. (e.g., ∠1 = ∠5, ∠2 = ∠6, ∠3 = ∠7, ∠4 = ∠8)
2. Alternate interior angles: On opposite sides of the transversal, between the parallel lines. They are EQUAL. (e.g., ∠3 = ∠6, ∠4 = ∠5)
3. Alternate exterior angles: On opposite sides of the transversal, outside the parallel lines. They are EQUAL. (e.g., ∠1 = ∠8, ∠2 = ∠7)
4. Co-interior angles (same-side interior / consecutive interior angles): On the same side of the transversal, between the parallel lines. They are SUPPLEMENTARY (add up to 180°). (e.g., ∠3 + ∠5 = 180°, ∠4 + ∠6 = 180°)
5. Vertically opposite angles: Formed at each intersection. Always equal. (e.g., ∠1 = ∠3, ∠2 = ∠4)
6. Linear pair: Angles on a straight line add to 180°.
Converse: If a transversal makes equal corresponding angles with two lines, then the lines are parallel.
Triangle angle sum property: Sum of all angles in a triangle = 180°. Exterior angle of a triangle = sum of the two non-adjacent interior angles.`,
      },
      {
        id: 'math-3',
        number: 3,
        title: 'Indices and Cube Root',
        marathiTitle: 'घातांक आणि घनमूळ',
        context: `Chapter 3: Indices and Cube Root
Indices (Exponents): aⁿ means a multiplied by itself n times. 'a' is the base, 'n' is the exponent/index.
Laws of Exponents (a, b > 0; m, n are integers):
1. aᵐ × aⁿ = aᵐ⁺ⁿ (same base, multiply → add exponents)
2. aᵐ ÷ aⁿ = aᵐ⁻ⁿ (same base, divide → subtract exponents)
3. (aᵐ)ⁿ = aᵐⁿ (power of power → multiply exponents)
4. (ab)ⁿ = aⁿbⁿ (power of product → distribute)
5. (a/b)ⁿ = aⁿ/bⁿ (power of quotient → distribute)
6. a⁰ = 1 (any non-zero base raised to 0 = 1)
7. a⁻ⁿ = 1/aⁿ (negative exponent = reciprocal)
8. a^(1/n) = ⁿ√a (fractional exponent = nth root)
9. a^(m/n) = (ⁿ√a)ᵐ = ⁿ√(aᵐ) (rational exponents)
Cube Root: The cube root of a number x is the number that, when multiplied by itself three times, gives x. Written as ∛x or x^(1/3). Example: ∛8 = 2 (because 2×2×2 = 8), ∛27 = 3, ∛125 = 5.
Perfect cubes: Numbers whose cube roots are integers. Examples: 1, 8, 27, 64, 125, 216, 343, 512, 729, 1000.
Finding cube root by prime factorisation: Prime factorise the number. Group factors in triples. Take one factor from each group. Example: ∛216 = ∛(2×2×2 × 3×3×3) = 2 × 3 = 6.`,
      },
      {
        id: 'math-4',
        number: 4,
        title: 'Altitudes and Medians of a Triangle',
        marathiTitle: 'त्रिकोणाच्या उंच्या आणि मध्यगा',
        context: `Chapter 4: Altitudes and Medians of a Triangle
Triangle: A polygon with 3 sides and 3 vertices. Key points and lines:
Altitude (Height): A perpendicular drawn from a vertex to the opposite side (or its extension). A triangle has 3 altitudes. The foot of the altitude is the point where it meets the opposite side. Altitudes can lie inside (acute triangle), on (right triangle: at the right angle vertex), or outside (obtuse triangle) the triangle. The three altitudes meet at a single point called the Orthocenter (H).
Median: A line segment from a vertex to the midpoint of the opposite side. A triangle has 3 medians. Each median divides the triangle into two triangles of equal area. The three medians always meet inside the triangle at a point called the Centroid (G). The centroid divides each median in the ratio 2:1 from vertex to midpoint (so the centroid is 2/3 of the way from each vertex to the midpoint of the opposite side).
Perpendicular bisector: A line perpendicular to a side and passing through its midpoint. The three perpendicular bisectors meet at the Circumcenter (O), which is equidistant from all three vertices. The circumcircle passes through all three vertices.
Angle bisector: A line from a vertex that bisects the angle. The three angle bisectors meet at the Incenter (I), which is equidistant from all three sides. The incircle is tangent to all three sides.
Euler line: The orthocenter (H), centroid (G), and circumcenter (O) are collinear (on the same line) for any triangle. The centroid divides this line in ratio 1:2 (HG:GO = 1:2).`,
      },
      {
        id: 'math-5',
        number: 5,
        title: 'Expansion Formulae',
        marathiTitle: 'विस्तार सूत्रे',
        context: `Chapter 5: Expansion Formulae (Algebraic Identities)
Algebraic identities are equations that are true for all values of the variables. They are used to expand expressions and simplify calculations.
Key identities to memorise:
1. (a + b)² = a² + 2ab + b²
2. (a - b)² = a² - 2ab + b²
3. (a + b)(a - b) = a² - b² (Difference of squares)
4. (a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca
5. (a + b)³ = a³ + 3a²b + 3ab² + b³ = a³ + b³ + 3ab(a + b)
6. (a - b)³ = a³ - 3a²b + 3ab² - b³ = a³ - b³ - 3ab(a - b)
7. a³ + b³ = (a + b)(a² - ab + b²) (Sum of cubes)
8. a³ - b³ = (a - b)(a² + ab + b²) (Difference of cubes)
9. (x + a)(x + b) = x² + (a + b)x + ab
Applications: Finding squares of numbers without direct multiplication. Example: 103² = (100 + 3)² = 10000 + 600 + 9 = 10609. Finding products: 98 × 102 = (100 - 2)(100 + 2) = 100² - 2² = 10000 - 4 = 9996.
From identity 1: a² + b² = (a+b)² - 2ab and 2ab = (a+b)² - (a²+b²).
Note: (a+b)² ≠ a² + b². The middle term 2ab must not be forgotten.`,
      },
      {
        id: 'math-6',
        number: 6,
        title: 'Factorisation of Algebraic Expressions',
        marathiTitle: 'बीजीय राशींचे गुणनखंड',
        context: `Chapter 6: Factorisation of Algebraic Expressions
Factorisation is the process of writing an algebraic expression as a product of its factors. It is the reverse of expansion.
Methods of Factorisation:
1. Common factor method: Find the HCF of all terms and factor it out.
   Example: 6x²y + 9xy² = 3xy(2x + 3y). Look for common variables and numerical factors.
2. Grouping method: Group terms, factor each group, then factor out common binomial.
   Example: ax + ay + bx + by = a(x + y) + b(x + y) = (a + b)(x + y)
3. Using identities:
   - Difference of squares: a² - b² = (a + b)(a - b)
   - Perfect square trinomials: a² + 2ab + b² = (a + b)², a² - 2ab + b² = (a - b)²
   - Sum/difference of cubes: a³ + b³ = (a+b)(a²-ab+b²); a³ - b³ = (a-b)(a²+ab+b²)
4. Factorisation of quadratic trinomials (x² + bx + c): Find two numbers p and q such that p + q = b and p × q = c. Then x² + bx + c = (x + p)(x + q).
   Example: x² + 5x + 6: Find two numbers with sum 5 and product 6: 2 and 3. So x² + 5x + 6 = (x + 2)(x + 3).
5. For ax² + bx + c (a ≠ 1): Find two numbers with sum = b and product = ac. Split the middle term and group.
Always check your factorisation by expanding back to the original expression.`,
      },
      {
        id: 'math-7',
        number: 7,
        title: 'Variation',
        marathiTitle: 'प्रमाण',
        context: `Chapter 7: Variation
Variation describes the relationship between two quantities as one changes.
Direct Variation (Direct Proportion): Two quantities x and y are in direct variation if they increase or decrease together proportionally. Written as x ∝ y or y = kx, where k is the constant of variation (constant of proportionality). When x doubles, y doubles; when x is halved, y is halved.
Properties: y/x = k (constant) for all values. The graph of y vs x is a straight line through the origin.
Examples: Distance and time at constant speed (d = vt); Total cost and number of items at fixed price; Simple interest and principal.
Inverse Variation (Inverse Proportion): Two quantities x and y are in inverse variation if one increases as the other decreases proportionally. Written as x ∝ 1/y or xy = k. When x doubles, y is halved.
Properties: x × y = k (constant). The graph of y vs x is a hyperbola.
Examples: Speed and time for fixed distance (v × t = d); Number of workers and days to complete a job; Pressure and volume of gas at constant temperature (Boyle's Law: PV = constant).
Solving variation problems: (1) Identify if direct or inverse. (2) Write the relationship (y=kx or xy=k). (3) Substitute known values to find k. (4) Use k to find the unknown.
Example (direct): If 5 pens cost ₹60, how much do 8 pens cost? k = 60/5 = 12; cost = 12 × 8 = ₹96.
Example (inverse): If 6 workers finish a job in 10 days, how long for 15 workers? k = 6 × 10 = 60; days = 60/15 = 4 days.`,
      },
      {
        id: 'math-8',
        number: 8,
        title: 'Quadrilateral: Constructions and Types',
        marathiTitle: 'चतुर्भुज: रचना आणि प्रकार',
        context: `Chapter 8: Quadrilateral: Constructions and Types
Quadrilateral: A polygon with 4 sides, 4 angles, and 4 vertices. Sum of all interior angles of any quadrilateral = 360°.
Types of Quadrilaterals:
1. Parallelogram: Opposite sides parallel and equal. Opposite angles equal. Diagonals bisect each other. Examples: rectangle, rhombus, square are special parallelograms.
2. Rectangle: All angles = 90°. Opposite sides equal and parallel. Diagonals equal and bisect each other. Properties of parallelogram + all right angles.
3. Rhombus: All sides equal. Opposite angles equal. Diagonals bisect each other at right angles (perpendicular). Diagonals bisect the angles.
4. Square: All sides equal AND all angles = 90°. Diagonals equal, perpendicular, and bisect each other. A square is both a rectangle and a rhombus.
5. Trapezium: Exactly one pair of parallel sides (called bases). The other two sides are called legs. Area = ½ × (sum of parallel sides) × height.
6. Kite: Two pairs of adjacent sides equal. One diagonal is the perpendicular bisector of the other. One pair of opposite angles equal.
Construction of quadrilaterals: You need 5 measurements (sides and diagonals) to uniquely determine a quadrilateral. Common constructions: Given 4 sides and one diagonal; Given 3 sides and 2 diagonals; Given 4 sides and one angle. Tools: ruler, compass, protractor, set square.`,
      },
      {
        id: 'math-9',
        number: 9,
        title: 'Discount and Commission',
        marathiTitle: 'सवलत आणि दलाली',
        context: `Chapter 9: Discount and Commission
Discount: A reduction on the marked price (listed price) of an article.
Key terms:
- Marked Price (MP) / List Price: The price marked on the article.
- Selling Price (SP): The actual price at which the article is sold.
- Discount (D): Amount reduced. Discount = MP - SP.
- Discount percentage (%): (Discount / MP) × 100.
Formulas:
- SP = MP - Discount = MP × (1 - discount%/100)
- If discount% is given: SP = MP × (100 - discount%)/100
- Discount% = [(MP - SP)/MP] × 100
Example: MP = ₹800, discount = 25%. SP = 800 × (100-25)/100 = 800 × 75/100 = ₹600.
Commission: Amount paid to an agent (salesperson or broker) for facilitating a transaction.
Key terms:
- Agent/Commission Agent: Person who buys or sells goods on behalf of others.
- Principal: Total value of goods bought or sold.
- Commission: Amount earned by the agent = Commission% × Principal / 100.
- Net amount received = Principal - Commission (if agent sells for the seller) or Principal + Commission (if agent buys for the buyer).
Example: An agent sells goods worth ₹12,000 at 5% commission. Commission = 12,000 × 5/100 = ₹600. Amount sent to owner = 12,000 - 600 = ₹11,400.
Multiple discounts (successive discounts): Two discounts of 20% and 10% are NOT equal to 30% discount. Calculate step by step: First discount on MP, then second discount on the reduced price.`,
      },
      {
        id: 'math-10',
        number: 10,
        title: 'Division of Polynomials',
        marathiTitle: 'बहुपदींची भागाकार',
        context: `Chapter 10: Division of Polynomials
Polynomial: An algebraic expression with one or more terms where variables have non-negative integer exponents. Degree = highest power of the variable.
Dividing a polynomial by a monomial: Divide each term of the polynomial by the monomial separately.
Example: (6x³ - 4x² + 2x) ÷ 2x = 3x² - 2x + 1
Dividing a polynomial by a binomial (long division): Similar to arithmetic long division.
Steps: (1) Arrange both dividend and divisor in descending order of powers. (2) Divide the leading term of dividend by leading term of divisor. (3) Multiply the result by the entire divisor. (4) Subtract. (5) Bring down the next term. (6) Repeat until degree of remainder < degree of divisor.
Dividend = Divisor × Quotient + Remainder.
Example: (x² + 7x + 12) ÷ (x + 3) = x + 4 (remainder 0). Verification: (x+3)(x+4) = x²+7x+12 ✓
Remainder Theorem: When polynomial p(x) is divided by (x - a), the remainder = p(a).
Example: Find remainder when p(x) = x³ - 3x² + x - 5 is divided by (x - 2). Remainder = p(2) = 8 - 12 + 2 - 5 = -7.
Factor Theorem: (x - a) is a factor of p(x) if and only if p(a) = 0.
Example: Is (x - 2) a factor of x³ - 6x² + 11x - 6? p(2) = 8 - 24 + 22 - 6 = 0. Yes, it is a factor.`,
      },
      {
        id: 'math-11',
        number: 11,
        title: 'Statistics',
        marathiTitle: 'सांख्यिकी',
        context: `Chapter 11: Statistics
Statistics is the science of collecting, organizing, analyzing, and interpreting data to make decisions.
Data: Raw facts and figures collected for a purpose. Primary data: Collected first-hand. Secondary data: Already collected by someone else.
Organizing data: Frequency distribution table (tally marks), grouped data (class intervals), cumulative frequency.
Measures of Central Tendency (Averages): A single value that represents the entire dataset.
Mean (Arithmetic Mean): Sum of all observations ÷ Number of observations. Mean = Σx/n.
For grouped data: Mean = Σ(f × m) / Σf, where f = frequency and m = class mark (midpoint of class interval).
Properties: Affected by every value; sensitive to extreme values (outliers).
Median: The middle value when data is arranged in ascending order. For odd n: median = ((n+1)/2)th value. For even n: median = average of (n/2)th and (n/2+1)th values. Not affected by extreme values.
Mode: The value that occurs most frequently in the data. A dataset can have no mode, one mode (unimodal), or multiple modes (bimodal, multimodal). Most useful for categorical data.
Relationship: Mean, Median, and Mode are related by Karl Pearson's formula: Mode = 3 Median - 2 Mean (approximately, for moderately skewed distributions).
Graphical representation: Bar graph (for discrete data), Histogram (for continuous grouped data, bars touch each other), Frequency polygon (connect midpoints of histogram tops), Pie chart (for proportions/parts of a whole).`,
      },
      {
        id: 'math-12',
        number: 12,
        title: 'Equations in One Variable',
        marathiTitle: 'एका चलातील समीकरण',
        context: `Chapter 12: Equations in One Variable (Linear Equations)
An equation is a mathematical statement that two expressions are equal. A linear equation in one variable has degree 1.
Standard form: ax + b = 0, where a ≠ 0. The solution (root) is the value of x that makes the equation true.
Rules for solving equations (maintain equality by doing same operation to both sides):
1. Transposition: Moving a term from one side to the other changes its sign.
   If ax + b = c, then ax = c - b (b is transposed).
   If a/x = b, then a = bx.
2. Cross multiplication: a/b = c/d → ad = bc.
Steps to solve: (1) Clear fractions/brackets. (2) Collect variable terms on one side, constants on the other. (3) Divide both sides by the coefficient of the variable. (4) Verify by substituting the answer.
Example: (3x - 2)/5 + (2x + 1)/3 = 2. Multiply through by LCM = 15: 3(3x-2) + 5(2x+1) = 30 → 9x - 6 + 10x + 5 = 30 → 19x - 1 = 30 → 19x = 31 → x = 31/19. Always verify!
Word problems: Let the unknown quantity be x. Translate the problem into an equation using keywords: "is" means =, "more than" means +, "less than" means -, "times" means ×, "of" often means ×.
Example: A number is 3 more than twice another. Their sum is 21. Find both numbers. Let smaller = x; larger = 2x + 3. x + 2x + 3 = 21 → 3x = 18 → x = 6; larger = 15.`,
      },
      {
        id: 'math-13',
        number: 13,
        title: 'Congruence of Triangles',
        marathiTitle: 'त्रिकोणांची एकरूपता',
        context: `Chapter 13: Congruence of Triangles
Congruent figures: Two figures are congruent if they have the same shape and size. Congruent triangles have the same corresponding sides and angles. Symbol: ≅
When writing congruence: The order of vertices matters. △ABC ≅ △DEF means A↔D, B↔E, C↔F.
Criteria for Congruence of Triangles:
1. SSS (Side-Side-Side): If all three sides of one triangle are equal to the corresponding three sides of another, the triangles are congruent.
2. SAS (Side-Angle-Side): If two sides and the included angle (angle between those sides) of one triangle are equal to the corresponding parts of another, the triangles are congruent.
3. ASA (Angle-Side-Angle): If two angles and the included side of one triangle are equal to the corresponding parts of another, the triangles are congruent.
4. AAS (Angle-Angle-Side): If two angles and any non-included side of one triangle are equal to the corresponding parts of another, the triangles are congruent.
5. RHS (Right angle-Hypotenuse-Side): If the hypotenuse and one side of a right triangle are equal to the hypotenuse and one side of another right triangle, the triangles are congruent. (Only for right triangles!)
IMPORTANT: AAA (three equal angles) is NOT a criterion for congruence (it gives similarity, not congruence). SSA (two sides and a non-included angle) is also NOT a reliable criterion.
CPCT (Corresponding Parts of Congruent Triangles): Once two triangles are proven congruent, ALL corresponding sides and angles are equal. This is used to prove further properties.`,
      },
      {
        id: 'math-14',
        number: 14,
        title: 'Compound Interest',
        marathiTitle: 'चक्रवाढ व्याज',
        context: `Chapter 14: Compound Interest
Simple Interest (SI): Calculated only on the original principal. SI = (P × R × T) / 100. Amount = P + SI.
Compound Interest (CI): Interest is calculated on the principal plus accumulated interest from previous periods. Interest is earned on interest ("interest on interest").
Formula for Compound Interest:
A = P × (1 + R/100)ⁿ, where A = Total Amount, P = Principal, R = Rate of interest per annum, n = Number of years (time periods).
CI = A - P = P[(1 + R/100)ⁿ - 1]
Comparison: For the same P, R, T: CI > SI because CI earns interest on accumulated interest. The difference CI - SI = P × (R/100)² for 2 years; for n years the difference grows.
For 2 years: CI - SI = P(R/100)²; this is the interest on the first year's SI.
Compounding more frequently: If compounded half-yearly (every 6 months): use R/2 as rate and 2n as time. If compounded quarterly: use R/4 as rate and 4n as time. More frequent compounding → higher effective interest.
A = P(1 + R/(2×100))^(2n) [half-yearly]
A = P(1 + R/(4×100))^(4n) [quarterly]
Growth and depreciation: The same formula applies. For depreciation (e.g., car value decreasing): A = P × (1 - R/100)ⁿ.
Example: ₹10,000 at 10% p.a. for 2 years compound interest: A = 10000 × (1.1)² = 10000 × 1.21 = ₹12,100. CI = ₹2,100. SI would be = 10000×10×2/100 = ₹2,000. Difference = ₹100.`,
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

export function getChapterByNumber(subjectId: string, number: number): Chapter | undefined {
  const subject = getSubject(subjectId);
  return subject?.chapters.find((c) => c.number === number);
}
