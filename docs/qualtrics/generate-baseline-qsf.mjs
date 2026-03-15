import fs from "fs";
import path from "path";

const surveyId = "SV_baseline2026";
let qCounter = 1;
let blockCounter = 1;

const countries = [
  "Germany", "Turkey", "Poland", "Russia", "Syria", "Ukraine", "Afghanistan", "Albania", "Algeria", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bangladesh", "Belarus", "Belgium", "Bosnia and Herzegovina",
  "Brazil", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Croatia", "Cyprus", "Czech Republic", "Denmark",
  "Egypt", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Ghana", "Greece", "Hungary", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kosovo", "Latvia",
  "Lebanon", "Libya", "Lithuania", "Luxembourg", "Morocco", "Netherlands", "Nigeria", "North Macedonia", "Norway",
  "Pakistan", "Palestine", "Portugal", "Romania", "Saudi Arabia", "Serbia", "Slovakia", "Slovenia", "Somalia",
  "South Africa", "South Korea", "Spain", "Sudan", "Sweden", "Switzerland", "Tunisia", "United Kingdom",
  "United States", "Vietnam", "Other"
];

function html(text) {
  return String(text).replace(/\n/g, "<br>");
}

function choiceMap(choices) {
  const out = {};
  choices.forEach((choice, index) => {
    const value = typeof choice === "string" ? choice : choice.text;
    out[String(index + 1)] = { Display: value };
    if (typeof choice === "object" && choice.textEntry) {
      out[String(index + 1)].TextEntry = "true";
    }
  });
  return out;
}

function answerMap(answers) {
  const out = {};
  answers.forEach((answer, index) => {
    out[String(index + 1)] = { Display: answer };
  });
  return out;
}

function baseQuestion({ type, selector, subSelector, text, tag, description }) {
  const qid = `QID${qCounter++}`;
  return {
    SurveyID: surveyId,
    Element: "SQ",
    PrimaryAttribute: qid,
    SecondaryAttribute: tag,
    TertiaryAttribute: null,
    Payload: {
      QuestionText: html(text),
      DataExportTag: tag,
      QuestionType: type,
      Selector: selector,
      SubSelector: subSelector,
      Configuration: {
        QuestionDescriptionOption: "UseText"
      },
      QuestionDescription: description ?? tag,
      QuestionID: qid,
      DataVisibility: {
        Private: false,
        Hidden: false
      },
      Language: [],
      NextChoiceId: 1,
      NextAnswerId: 1,
      QuestionText_Unsafe: html(text)
    }
  };
}

function descriptive(tag, text) {
  return baseQuestion({
    type: "DB",
    selector: "TB",
    subSelector: "ML",
    text,
    tag,
    description: tag
  });
}

function textEntry(tag, text, opts = {}) {
  const q = baseQuestion({
    type: "TE",
    selector: opts.multiLine ? "ML" : "SL",
    subSelector: "TX",
    text,
    tag,
    description: tag
  });
  q.Payload.Validation = {
    Settings: {
      ForceResponse: opts.required === false ? "OFF" : "ON",
      ForceResponseType: "ON",
      Type: "None"
    }
  };
  return q;
}

function multipleChoice(tag, text, choices, opts = {}) {
  const multi = Boolean(opts.multi);
  const q = baseQuestion({
    type: "MC",
    selector: multi ? "MAVR" : (opts.dropdown ? "DL" : "SAVR"),
    subSelector: opts.dropdown ? "TX" : "TX",
    text,
    tag,
    description: tag
  });
  q.Payload.Choices = choiceMap(choices);
  q.Payload.ChoiceOrder = choices.map((_, index) => index + 1);
  q.Payload.Validation = {
    Settings: {
      ForceResponse: opts.required === false ? "OFF" : "ON",
      ForceResponseType: "ON",
      Type: "None"
    }
  };
  q.Payload.NextChoiceId = choices.length + 1;
  return q;
}

function matrix(tag, text, statements, scale, opts = {}) {
  const q = baseQuestion({
    type: "Matrix",
    selector: "Likert",
    subSelector: "SingleAnswer",
    text,
    tag,
    description: tag
  });
  q.Payload.Choices = choiceMap(statements);
  q.Payload.Answers = answerMap(scale);
  q.Payload.ChoiceOrder = statements.map((_, index) => index + 1);
  q.Payload.AnswerOrder = scale.map((_, index) => index + 1);
  q.Payload.Validation = {
    Settings: {
      ForceResponse: opts.required === false ? "OFF" : "ON",
      ForceResponseType: "ON",
      Type: "None"
    }
  };
  q.Payload.NextChoiceId = statements.length + 1;
  q.Payload.NextAnswerId = scale.length + 1;
  return q;
}

function slider(tag, text, min, max, opts = {}) {
  const q = baseQuestion({
    type: "Slider",
    selector: "HBAR",
    subSelector: "SN",
    text,
    tag,
    description: tag
  });
  q.Payload.Configuration = {
    CSSliderMin: min,
    CSSliderMax: max,
    ShowValue: "true",
    SnapToGrid: "true",
    GridLines: max - min,
    NumDecimals: 0,
    QuestionDescriptionOption: "UseText"
  };
  q.Payload.Validation = {
    Settings: {
      ForceResponse: opts.required === false ? "OFF" : "ON",
      ForceResponseType: "ON",
      Type: "None"
    }
  };
  return q;
}

function constantSum(tag, text, choices, total = 100) {
  const q = baseQuestion({
    type: "CS",
    selector: "TE",
    subSelector: "IV",
    text,
    tag,
    description: tag
  });
  q.Payload.Choices = choiceMap(choices);
  q.Payload.ChoiceOrder = choices.map((_, index) => index + 1);
  q.Payload.Configuration = {
    QuestionDescriptionOption: "UseText",
    AllowTotalOver: "false",
    AllowTotalUnder: "false",
    TotalSum: total,
    TextPosition: "inline"
  };
  q.Payload.Validation = {
    Settings: {
      ForceResponse: "ON",
      ForceResponseType: "ON",
      Type: "None"
    }
  };
  q.Payload.NextChoiceId = choices.length + 1;
  return q;
}

function block(description, questions) {
  const id = `BL_${blockCounter++}`;
  return {
    id,
    element: {
      SurveyID: surveyId,
      Element: "BL",
      PrimaryAttribute: description,
      SecondaryAttribute: null,
      TertiaryAttribute: null,
      Payload: {
        Type: "Standard",
        Description: description,
        ID: id,
        BlockElements: questions.map((question) => ({
          Type: "Question",
          QuestionID: question.PrimaryAttribute
        }))
      }
    }
  };
}

const questions = [];
const blocks = [];

function addBlock(description, items) {
  questions.push(...items);
  blocks.push(block(description, items));
}

const introText = descriptive("INTRO_INFO", `Information on Participating in a Scientific Study

Dear students,

You are invited to participate in a scientific study. In this study, we are investigating how young people handle information on the internet and how they evaluate content on social media.

Participation is voluntary. The questionnaire lasts approximately 15-20 minutes per class period. No names or directly identifying information are stored, and results are only published in anonymized form.

Please read the next section carefully and only continue if you agree.`);

const privacyText = descriptive("INTRO_PRIVACY", `Informed Consent and Data Privacy

The project team operates in accordance with the GDPR and the German Federal Data Protection Act. Questionnaire data on media literacy, demographic characteristics, and political attitudes will be collected and analyzed by authorized researchers only.

You may withdraw your consent until October 31, 2026, using your anonymous participation code. After anonymization, withdrawal is no longer possible.`);

const consent = multipleChoice(
  "CONSENT",
  "I have read the information above and agree to participate in the study and to the use of my data as described.",
  ["I agree and want to participate.", "I do not agree."],
  { required: true }
);

addBlock("Intro & Consent", [introText, privacyText, consent]);

addBlock("Anonymous Code", [
  textEntry("CODE_MOTHER", "First two letters of your mother's first name (a-z):"),
  textEntry("CODE_BIRTHMONTH", "Your birth month (01-12):"),
  textEntry("CODE_SIBLINGS", "How many older siblings do you have (00-99)?"),
  textEntry("CODE_STREET", "First two letters of the street you live on (a-z):")
]);

addBlock("Demographics", [
  textEntry("ZIP_CODE", "Which zip code do you currently live in?"),
  multipleChoice("GENDER", "Which of the following categories best describes your gender identity?", [
    "Female", "Male", "Non-binary/diverse", "Other/Prefer not to say"
  ]),
  multipleChoice("BIRTH_YEAR", "Please select your year of birth from the list below.", [
    "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"
  ], { dropdown: true }),
  multipleChoice("FAMILY_ROOTS", "From which world regions do your family roots originate? Select all that apply.", [
    "Germany", "Other Western Europe", "Eastern Europe", "Middle East", "West Asia", "North Africa",
    "Sub-Saharan Africa", "Central or South Asia", "East or Southeast Asia", "North America",
    "Central America", "Caribbean", "South America", { text: "Other", textEntry: true }, "Prefer not to say"
  ], { multi: true }),
  multipleChoice("BIRTH_COUNTRY", "In which country were you born?", countries, { dropdown: true }),
  multipleChoice("AGE_ARRIVAL", "If you were not born in Germany: How old were you when you arrived in Germany?", [
    "age 0-1", "age 2", "age 3", "age 4", "age 5", "age 6", "age 7", "age 8", "age 9",
    "age 10", "age 11", "age 12", "age 13", "age 14", "age 15", "age 16", "age 17", "age 18", "age 19"
  ], { dropdown: true, required: false }),
  multipleChoice("HOME_LANGUAGE", "What language do you speak at home most of the time?", [
    "German only", "German and another language", { text: "Another language", textEntry: true }
  ]),
  multipleChoice("RELIGION", "What is your religion, if any?", [
    "None", "Christian (Catholic/Protestant/Orthodox)", "Muslim", "Jewish", "Hindu", "Buddhist",
    { text: "Other", textEntry: true }, "Prefer not to say"
  ]),
  multipleChoice("BOOKS_HOME", "How many books are there in your home?", [
    "There are no books.", "1-10 books", "11-25 books", "26-100 books",
    "101-200 books", "201-500 books", "More than 500 books"
  ]),
  multipleChoice("CAR_OWNERSHIP", "Does your family own a car, van or truck?", [
    "No", "Yes, one", "Yes, two or more"
  ]),
  multipleChoice("OWN_BEDROOM", "Do you have your own bedroom for yourself?", ["Yes", "No"]),
  multipleChoice("COMPUTERS_HOME", "How many computers do your family own (including laptops and tablets, not including game consoles and smartphones)?", [
    "None", "One", "Two", "More than two"
  ]),
  multipleChoice("BATHROOMS_HOME", "How many bathrooms (room with a bath/shower or both) are in your home?", [
    "None", "One", "Two", "More than two"
  ]),
  multipleChoice("DISHWASHER", "Does your family have a dishwasher at home?", ["Yes", "No"]),
  multipleChoice("HOLIDAYS_ABROAD", "How many times did you and your family travel out of Germany for a holiday/vacation last year?", [
    "Not at all", "Once", "Twice", "More than twice"
  ])
]);

addBlock("Voting Experiences Intentions", [
  multipleChoice("ATTN_VOTE", "Help us keep track of who is paying attention. Please select \"Somewhat disagree\" in the options below.", [
    "Strongly agree", "Agree", "Somewhat agree", "Neither agree nor disagree",
    "Somewhat disagree", "Disagree", "Strongly disagree"
  ]),
  constantSum("VOTE_LIKELIHOOD_100", "If the upcoming Berlin state election were held next Sunday, how likely is it that you would vote for each of the following parties? Please distribute 100 percentage points across the options below.", [
    "CDU", "SPD", "Bündnis 90/Die Grünen", "FDP", "AfD", "Die Linke", "Volt", "Freie Wähler", "BSW",
    "Other", "I would not vote", "Prefer not to answer"
  ]),
  multipleChoice("LEGAL_VOTE_2026", "Are you legally allowed to vote in the upcoming 2026 state elections in Berlin?", [
    "Yes", "No"
  ]),
  multipleChoice("WOULD_VOTE_IF_ALLOWED", "If you were allowed to vote, would you intend to vote?", [
    "Yes", "No", "Not sure yet"
  ], { required: false }),
  multipleChoice("PARTY_IF_ALLOWED", "If you were allowed to vote, which party would you intend to vote for?", [
    "CDU", "SPD", "Bündnis 90/Die Grünen", "FDP", "AfD", "Die Linke", "Volt", "Freie Wähler", "BSW",
    { text: "Another party", textEntry: true }, "Prefer not to answer"
  ], { required: false }),
  multipleChoice("WHY_NOT_VOTE_IF_ALLOWED", "If you were allowed to vote and would not intend to vote, which of the following best describes why?", [
    "I am not interested in the election", "I do not have enough information to decide",
    "I do not like any of the parties or candidates", "I do not believe voting makes a difference",
    { text: "Other", textEntry: true }
  ], { required: false }),
  multipleChoice("INTEND_TO_VOTE", "If you are legally allowed to vote: Do you intend to vote?", [
    "Yes", "No", "Not sure yet"
  ], { required: false }),
  multipleChoice("PARTY_INTEND", "Which party do you intend to vote for?", [
    "CDU", "SPD", "Bündnis 90/Die Grünen", "FDP", "AfD", "Die Linke", "Volt", "Freie Wähler", "BSW",
    { text: "Another party", textEntry: true }, "Prefer not to answer"
  ], { required: false }),
  multipleChoice("WHY_NOT_VOTE", "If you do not intend to vote, which of the following best describes why?", [
    "I am not interested in the election", "I do not have enough information to decide",
    "I do not like any of the parties or candidates", "I do not believe voting makes a difference",
    { text: "Other", textEntry: true }
  ], { required: false }),
  multipleChoice("VOTED_2025", "Did you vote in the last federal election in Germany (2025 Bundestag election)?", [
    "Yes", "No, I wasn’t eligible to vote", "No, I chose not to", "Prefer not to say"
  ]),
  multipleChoice("POL_KNOW_1", "Who elects the German Federal Chancellor?", [
    "The public directly", "The Bundestag", "The Federal President", "I don’t know"
  ]),
  multipleChoice("POL_KNOW_2", "What is the main role of the Bundestag?", [
    "To interpret the constitution", "To make laws and oversee the government", "To run local governments", "I don’t know"
  ]),
  multipleChoice("POL_KNOW_3", "Which of the following is a key feature of democracy?", [
    "One leader makes decisions alone", "Citizens can vote in free elections", "The military controls government", "I don’t know"
  ]),
  multipleChoice("POL_KNOW_4", "Why are opposition parties important in a democracy?", [
    "They help the government stay in power",
    "They represent different views and hold government accountable",
    "They control the courts", "I don’t know"
  ]),
  multipleChoice("POL_KNOW_5", "Which institution ensures that laws follow the constitution in Germany?", [
    "Bundestag", "Federal Constitutional Court", "Federal Police", "I don’t know"
  ])
]);

addBlock("Social Media Use", [
  slider("SM_HOURS", "On an average day, how many hours in total do you spend using social media platforms?", 0, 24),
  matrix("SM_POLINFO_FREQ", "In the past 3 months, how often have you used the following sources for political information?", [
    "Instagram", "TikTok", "Snapchat", "Podcasts", "Radio", "Newspapers (print or online)",
    "Television news", "Friends", "Family", "School", "Fact-checking websites", "Other online sources"
  ], ["Never", "Rarely", "Sometimes", "Often", "Very often"]),
  textEntry("SM_TOP_SOURCE_1", "Thinking about the past three months, which source have you used most often to get political information? (1 of up to 5)", { required: false }),
  textEntry("SM_TOP_SOURCE_2", "Most-used political information source (2 of up to 5)", { required: false }),
  textEntry("SM_TOP_SOURCE_3", "Most-used political information source (3 of up to 5)", { required: false }),
  textEntry("SM_TOP_SOURCE_4", "Most-used political information source (4 of up to 5)", { required: false }),
  textEntry("SM_TOP_SOURCE_5", "Most-used political information source (5 of up to 5)", { required: false }),
  multipleChoice("SM_SHARE_TYPES", "Which of these types of content would you consider sharing on social media (if any)? Select all that apply.", [
    "Political news", "Sports news", "Celebrity news/entertainment", "Science/technology news", "Business news",
    { text: "Other", textEntry: true }
  ], { multi: true }),
  matrix("SM_NEWS_BEHAVIOR", "How often do you engage in the following activities related to news and information?", [
    "Read, view, or listen to news and information produced by major news organizations or publications at the original source.",
    "Read or listen to information or points of view from people, media sources, or organizations with whom you often disagree.",
    "Confirm that a news story is really true by looking across multiple information sources.",
    "Pass on news and information to others without first checking its accuracy or the integrity of the source."
  ], ["Never", "Rarely", "Sometimes", "Often", "Very often"]),
  multipleChoice("SM_MANIPULATIVE", "In the past two weeks, how often have you thought while viewing online content: “This seems manipulative”?", [
    "Never", "Rarely", "Sometimes", "Often", "Very often"
  ])
]);

addBlock("Socio-Political Opinions", [
  matrix("POL_EFFICACY", "Please indicate to what extent you agree or disagree with each of the statements.", [
    "I am good at understanding and assessing important political issues.",
    "Politicians strive to keep in close touch with the people.",
    "I have the confidence to take active part in a discussion about political issues.",
    "Politicians care about what ordinary people think."
  ], ["Do not agree at all", "Slightly agree", "Somewhat agree", "Agree", "Completely agree"]),
  multipleChoice("POL_INTEREST", "How interested would you say you are in politics?", [
    "Very interested", "Quite interested", "Hardly interested", "Not at all interested", "Don’t know / don’t want to answer"
  ]),
  slider("LEFT_RIGHT", "In politics people sometimes talk of 'left' and 'right'. Where would you place yourself on this scale, where 0 means the left and 10 means the right?", 0, 10),
  matrix("PARTY_CLOSENESS", "How close do you feel to the following parties?", [
    "CDU", "SPD", "Bündnis 90/Die Grünen", "FDP", "AfD", "Die Linke", "Volt", "BSW"
  ], ["Very close", "Quite close", "Not close", "Not at all close", "Don’t know / don’t want to answer"]),
  matrix("INST_TRUST", "How much do you personally trust each of the institutions or groups of people listed below?", [
    "Germany’s parliament", "The legal system", "The police", "Politicians",
    "Political parties", "The European Parliament", "The United Nations", "Scientists"
  ], ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]),
  slider("SOCIAL_TRUST", "Generally speaking, would you say that most people can be trusted, or that you can't be too careful in dealing with people?", 0, 10),
  matrix("SYSTEM_EVAL", "Please think about the political system in our country. For each statement, indicate whether you strongly approve, widely approve, widely disapprove, or strongly disapprove.", [
    "The political system of the Federal Republic of Germany is just and fair.",
    "The political system of the Federal Republic of Germany protects the fundamental freedoms of its citizens."
  ], ["Strongly approve", "Widely approve", "Widely disapprove", "Strongly disapprove"]),
  matrix("SYSTEM_VIEWS", "For each of the following views, indicate whether you strongly approve, widely approve, widely disapprove, or strongly disapprove.", [
    "In the political system of the Federal Republic of Germany, only the well-being of a few special interest groups is considered, not the well-being of all population groups.",
    "Every population group has an equal opportunity to influence politics in the political system of the Federal Republic of Germany."
  ], ["Strongly approve", "Widely approve", "Widely disapprove", "Strongly disapprove"]),
  matrix("BERLIN_ISSUES", "Below is a list of topics often discussed in Berlin and/or Germany. For each statement, please indicate how strongly you agree or do not agree.", [
    "Berlin should continue to pursue the goal of climate neutrality.",
    "Public broadcasting (e.g., RBB) should be reduced in size.",
    "Asylum seekers should remain in collective accommodation until a decision has been made on their application.",
    "Every public building should provide at least one gender-neutral restroom that can be used regardless of gender.",
    "In Berlin daycare centers and schools, the traditional family model (father, mother, children) should be emphasized.",
    "Berlin should continue to comply with the legal limit on public borrowing (debt brake).",
    "The state of Berlin should advocate for easing the sanctions against Russia.",
    "The rent control regulation (Mietpreisbremse) in Berlin should be abolished.",
    "The use of social media should be more strictly restricted for minors.",
    "The German armed forces (Bundeswehr) should be allowed to provide information about their work in schools in Rhineland-Palatinate.",
    "Recipients of citizens’ income (Bürgergeld) who repeatedly miss appointments at the job center should continue to face benefit reductions.",
    "All employees should be able to retire without reductions after 40 contribution years.",
    "The top income tax rate should be increased.",
    "New heating systems should continue to be allowed to run entirely on fossil fuels (e.g., gas or oil).",
    "The statutory minimum wage should be increased to at least 15 euros per hour."
  ], ["Strongly agree", "Somewhat agree", "Neither agree nor disagree", "Somewhat disagree", "Strongly disagree"]),
  constantSum("DONATION_PARTIES", "Imagine you are given €100. Please decide how you would divide the €100 among the following parties. The total must add up to €100.", [
    "CDU", "SPD", "Bündnis 90/Die Grünen", "FDP", "AfD", "Die Linke", "Volt", "BSW"
  ])
]);

addBlock("Personality & Misc Measures", [
  matrix("SOCIAL_DESIRABILITY", "The following statements may apply more or less to you personally. Please indicate to what extent they apply to you.", [
    "In an argument, I always remain objective and stick to the facts.",
    "Even if I am feeling stressed, I am always friendly and polite to others.",
    "When talking to someone, I always listen carefully to what the other person says.",
    "It has happened that I have taken advantage of someone in the past.",
    "I have occasionally thrown litter away in the countryside or on to the road.",
    "Sometimes I only help people if I expect to get something in return."
  ], ["Doesn’t apply at all", "Applies a bit", "Applies somewhat", "Applies mostly", "Applies completely"]),
  slider("CLASS_LEFT_PERCENT", "Among students in your class, what percentage do you think supports left-leaning political parties?", 0, 100),
  slider("CLASS_RIGHT_PERCENT", "Among students in your class, what percentage do you think supports right-leaning political parties?", 0, 100),
  matrix("SELF_EFFICACY", "To what extent do you think each statement applies to you personally?", [
    "I can rely on my own abilities in difficult situations.",
    "I am able to solve most problems on my own.",
    "I can usually solve even challenging and complex tasks well."
  ], ["Does not apply at all", "Applies a bit", "Applies somewhat", "Applies mostly", "Applies completely"]),
  slider("LIFE_LADDER", "Please imagine a ladder with steps numbered from zero at the bottom to 10 at the top. On which step of the ladder would you say you personally feel you stand at this time?", 0, 10),
  matrix("AOT_SCALE", "Please indicate the extent to which you agree or disagree with the following statements.", [
    "When you encounter experiences or observations that seem to contradict your beliefs, you consider revising those beliefs.",
    "If something feels true to you, you are still open to considering experiences or observations that may challenge it.",
    "When you have experiences or observations that conflict with your current beliefs, you take time to re-evaluate those beliefs.",
    "You are willing to reconsider your beliefs if you encounter convincing experiences or observations that seem to contradict them.",
    "Encountering experiences or observations that challenge your beliefs encourages you to reflect on whether your beliefs might need to change.",
    "When faced with experiences or observations that challenge what you believe to be true, you are open to exploring new perspectives."
  ], ["Strongly disagree", "Disagree", "Somewhat disagree", "Somewhat agree", "Agree", "Strongly agree"])
]);

addBlock("School Background", [
  multipleChoice("SUBJECT", "In which subject did you take this survey?", [
    "History", "Politics/Civics", "Social Studies", { text: "Other", textEntry: true }
  ]),
  multipleChoice("COURSE_LEVEL", "Is this course taught at a basic level or an advanced level?", [
    "Basic level", "Advanced level"
  ]),
  multipleChoice("CLASS_DISCUSSION", "How often did you discuss political or social issues in class in the past school year?", [
    "Never", "A few times during the year", "About once a month", "A few times a month", "About once a week or more"
  ]),
  multipleChoice("GRADING_SYSTEM", "Do you receive points (0-15) or grades (1-6) for exams?", [
    "Points", "Grades"
  ]),
  textEntry("LAST_MATH_GRADE", "What was the last math grade you got?"),
  textEntry("CLASS_CODE", "Please enter the class code provided by your teacher:"),
  multipleChoice("EFFORT", "Lastly, please tell us how much effort you put forth towards this study.", [
    "Almost no", "Very little", "Some", "Quite a bit", "A lot"
  ])
]);

addBlock("Thank You", [
  descriptive("THANK_YOU", "Thank you very much for taking part in this study.<br><br>We appreciate the time and effort you invested in answering the questions. Your participation contributes meaningfully to our research.")
]);

const surveyElements = [
  ...questions,
  ...blocks.map((entry) => entry.element),
  {
    SurveyID: surveyId,
    Element: "FL",
    PrimaryAttribute: "Survey Flow",
    SecondaryAttribute: null,
    TertiaryAttribute: null,
    Payload: {
      Type: "Root",
      Flow: blocks.map((entry) => ({
        ID: entry.id,
        Type: "Block",
        FlowID: `FL_${entry.id}`,
        Autofill: []
      })),
      Properties: {
        Count: blocks.length
      }
    }
  },
  {
    SurveyID: surveyId,
    Element: "SO",
    PrimaryAttribute: "Survey Options",
    SecondaryAttribute: null,
    TertiaryAttribute: null,
    Payload: {
      SurveyProtection: "ByInvitation",
      SurveyTermination: "DefaultMessage",
      Header: "",
      Footer: "",
      ProgressBarDisplay: "None",
      PartialData: "+1 week",
      ValidationMessage: {
        Settings: {
          ForceResponse: "Please answer this question before continuing."
        }
      }
    }
  },
  {
    SurveyID: surveyId,
    Element: "PROJ",
    PrimaryAttribute: "CORE",
    SecondaryAttribute: null,
    TertiaryAttribute: null,
    Payload: {
      ProjectCategory: "CORE"
    }
  },
  {
    SurveyID: surveyId,
    Element: "STAT",
    PrimaryAttribute: "Survey Statistics",
    SecondaryAttribute: null,
    TertiaryAttribute: null,
    Payload: {
      SurveyStartDate: "0000-00-00 00:00:00",
      SurveyCreationDate: "2026-03-12 00:00:00",
      LastModified: "2026-03-12 00:00:00",
      ResponseCount: 0
    }
  }
];

const qsf = {
  SurveyEntry: {
    SurveyID: surveyId,
    SurveyName: "Baseline Survey",
    SurveyDescription: null,
    SurveyOwnerID: "UR_IMPORT",
    SurveyBrandID: "IMPORT",
    DivisionID: null,
    SurveyLanguage: "EN",
    SurveyActiveResponseSet: "RS_import",
    SurveyStatus: "Inactive",
    SurveyStartDate: "0000-00-00 00:00:00",
    SurveyExpirationDate: "0000-00-00 00:00:00",
    SurveyCreationDate: "2026-03-12 00:00:00",
    CreatorID: "UR_IMPORT",
    LastModified: "2026-03-12 00:00:00"
  },
  SurveyElements: surveyElements
};

const outDir = path.resolve("docs/qualtrics");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "baseline-survey.qsf"), JSON.stringify(qsf, null, 2));
console.log(`Wrote ${path.join(outDir, "baseline-survey.qsf")}`);
