// mockData.ts
export const faqData = [
  {
    question: "What is voter registration?",
    answer: "Voter registration is the process of signing up with your local election authority so you are officially listed on the electoral roll and eligible to vote."
  },
  {
    question: "Who can vote?",
    answer: "Generally, citizens who meet the minimum voting age (often 18) and have registered in their constituency can vote. Restrictions may apply depending on your region's laws."
  },
  {
    question: "What if I miss registration?",
    answer: "If you miss the deadline to register, you usually cannot vote in the upcoming election. Some regions offer same-day registration, but you must confirm this with your local authority."
  },
  {
    question: "What should I bring on election day?",
    answer: "You typically need to bring a valid, government-issued photo ID (like a voter ID card, passport, or driver's license). Check your local requirements to be sure."
  },
  {
    question: "How is my vote kept secret?",
    answer: "Polling stations are designed with private booths. When you cast your ballot (either on paper or an electronic voting machine), your name is not linked to the choice you make."
  },
  {
    question: "What happens after polls close?",
    answer: "Once polls close, officials secure the ballot boxes or machines. The counting process begins under the supervision of election officials and authorized observers."
  },
  {
    question: "How are results announced?",
    answer: "Results are usually announced by the official election commission after all votes are counted and verified. Preliminary results may be shared by news outlets earlier."
  },
  {
    question: "Can election rules differ by region?",
    answer: "Yes, significantly. Even within the same country, detailed rules regarding ID requirements, registration deadlines, and voting methods can vary by state or province."
  },
  {
    question: "What is a polling booth?",
    answer: "A polling booth is a designated, private area within a polling station where you actually mark your ballot or press the button to cast your vote."
  },
  {
    question: "What is vote counting?",
    answer: "Vote counting is the official process of tallying all legally cast ballots to determine the winner of an election."
  }
];

export const glossaryData = [
  { term: "Election", definition: "A formal and organized process of choosing a person for political office or deciding on a public issue by voting." },
  { term: "Voter Registration", definition: "The requirement that a person eligible to vote enroll before they will be entitled to vote." },
  { term: "Candidate", definition: "A person who applies for a job or is nominated for election." },
  { term: "Ballot", definition: "The device used to record choices made by voters. It can be a piece of paper or a digital screen." },
  { term: "Polling Station", definition: "A building (such as a school or community center) where voting takes place during an election." },
  { term: "Constituency", definition: "A body of voters in a specified area who elect a representative to a legislative body." },
  { term: "Campaign", definition: "An organized effort which seeks to influence the decision making process within a specific group, usually referring to convincing voters." },
  { term: "Counting", definition: "The process of tallying the votes cast in an election." },
  { term: "Result", definition: "The outcome of the election, determining the winner." },
  { term: "Turnout", definition: "The percentage of eligible voters who cast a ballot in an election." },
  { term: "Nomination", definition: "The official proposal of a candidate for election." },
  { term: "Election Commission", definition: "An independent body charged with ensuring that elections are conducted in a free and fair manner." }
];

export const timelineData = [
  {
    id: 1,
    title: "Election Announcement",
    description: "The official date of the election is declared by the election authority. Deadlines for registration and campaigning are set."
  },
  {
    id: 2,
    title: "Voter Registration Period",
    description: "Citizens must register or update their details on the electoral roll. Missing this deadline usually means you cannot vote."
  },
  {
    id: 3,
    title: "Candidate Nomination",
    description: "Individuals officially file papers to run for office. Their eligibility is checked by the election commission."
  },
  {
    id: 4,
    title: "Campaign Period",
    description: "Candidates hold rallies, debates, and share their platforms to convince citizens to vote for them."
  },
  {
    id: 5,
    title: "Voting Day",
    description: "Citizens go to their assigned polling stations to cast their ballots."
  },
  {
    id: 6,
    title: "Counting",
    description: "Ballots are securely collected and tallied by election officials under strict observation."
  },
  {
    id: 7,
    title: "Results & Government Formation",
    description: "The final counts are certified, winners are announced, and the transition of power or formation of the new government begins."
  }
];

export const quizData = [
  {
    question: "Do you need to be registered to vote?",
    options: ["Yes, almost always", "No, anyone can just walk in", "Only if you want to vote by mail"],
    correctAnswer: 0,
    explanation: "Voter registration is a mandatory prerequisite in most democratic systems to verify eligibility."
  },
  {
    question: "Is your vote public knowledge?",
    options: ["Yes", "No, voting is secret"],
    correctAnswer: 1,
    explanation: "The secret ballot is a fundamental principle of free elections, ensuring no one can intimidate you based on how you vote."
  },
  {
    question: "What is a 'Constituency'?",
    options: ["A political party", "A specific geographic area represented by an elected official", "The machine used to count votes"],
    correctAnswer: 1,
    explanation: "A constituency (or district) is the specific area and group of voters a candidate represents."
  },
  {
    question: "Can election rules (like ID requirements) vary by region?",
    options: ["No, they are universally the same", "Yes, they can vary significantly by state or country"],
    correctAnswer: 1,
    explanation: "Election laws are often handled locally or regionally, meaning rules about IDs and deadlines can change depending on where you live."
  },
  {
    question: "What is the purpose of an 'Election Commission'?",
    options: ["To tell people who to vote for", "To ensure elections are fair, free, and follow the law", "To raise money for candidates"],
    correctAnswer: 1,
    explanation: "An Election Commission is a neutral body responsible for overseeing the logistics and integrity of the election process."
  }
];

export const chatAssistantResponses: Record<string, string> = {
  "explain the election process simply": "The election process generally follows these steps: First, an election is announced. Then, voters register. Candidates are nominated and campaign. On Election Day, registered voters cast their secret ballots. Finally, the votes are counted and the winner is announced.",
  "what happens before election day?": "Before Election Day, you need to ensure you are registered to vote and know where your polling station is. Candidates formulate their platforms and campaign to win your support.",
  "how does voter registration work?": "Voter registration involves submitting your details to the local election authority to prove you are an eligible citizen. This puts your name on the official voter list, which is checked at the polling station.",
  "what should i carry to vote?": "You should carry an accepted form of identification. While this varies, it usually involves a government-issued photo ID like a driver's license or a specific Voter ID card.",
  "what happens after voting ends?": "After voting ends, the ballot boxes are sealed and taken to a counting center. Election officials count the votes, sometimes taking several days, before officially declaring the results.",
  "default": "I'm an educational assistant focused on the election process. I might not understand that specific question perfectly. Try asking about voter registration, the election timeline, or what to bring on voting day!"
};
