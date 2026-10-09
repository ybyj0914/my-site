export type Dimension =
  | "健康"
  | "事业"
  | "财务"
  | "关系"
  | "休闲"
  | "成长";

export type Question = {
  id: number;
  text: string;
  dimension: Dimension;
  subDimension: string;
  reversed: boolean;
};

export const dimensions: {
  key: Dimension;
  label: string;
  subDimensions: string[];
}[] = [
  {
    key: "健康",
    label: "身心健康",
    subDimensions: ["作息睡眠", "体能精力", "情绪稳定", "压力内耗"],
  },
  {
    key: "事业",
    label: "职业事业",
    subDimensions: ["生存安稳", "回报匹配", "职场环境", "职业成长"],
  },
  {
    key: "财务",
    label: "财务理财",
    subDimensions: ["理性消费", "应急储备", "负债压力", "资产配置"],
  },
  {
    key: "关系",
    label: "亲密关系",
    subDimensions: ["家庭氛围", "责任负担", "亲子关系", "伴侣关系"],
  },
  {
    key: "休闲",
    label: "休闲社交",
    subDimensions: ["兴趣爱好", "阅历体验", "朋友知己", "人脉关系"],
  },
  {
    key: "成长",
    label: "个人成长",
    subDimensions: ["心性品格", "目标追求", "认知思考", "能力提升"],
  },
];

export const questions: Question[] = [
  // ===== 健康 =====
  { id: 1, text: "我日常作息整体规律，很少习惯性晚睡熬夜。", dimension: "健康", subDimension: "作息睡眠", reversed: false },
  { id: 2, text: "我入睡顺畅，睡眠质量较好，不易多梦易醒。", dimension: "健康", subDimension: "作息睡眠", reversed: false },
  { id: 3, text: "我经常熬夜，作息不太规律。", dimension: "健康", subDimension: "作息睡眠", reversed: true },
  { id: 4, text: "我日常体能状态良好，轻微活动不易疲惫乏力。", dimension: "健康", subDimension: "体能精力", reversed: false },
  { id: 5, text: "我整体精神状态饱满，白天不容易困倦萎靡。", dimension: "健康", subDimension: "体能精力", reversed: false },
  { id: 6, text: "我经常感到体虚乏力，精神不济。", dimension: "健康", subDimension: "体能精力", reversed: true },
  { id: 7, text: "我日常心态平和，不易莫名烦躁易怒。", dimension: "健康", subDimension: "情绪稳定", reversed: false },
  { id: 8, text: "遇到不顺心，我能控制情绪不冲动爆发。", dimension: "健康", subDimension: "情绪稳定", reversed: false },
  { id: 9, text: "我很容易莫名烦躁，情绪起伏大。", dimension: "健康", subDimension: "情绪稳定", reversed: true },
  { id: 10, text: "我生活整体压力可控，不会长期紧绷焦虑。", dimension: "健康", subDimension: "压力内耗", reversed: false },
  { id: 11, text: "我不反复纠结过往琐事，陷入精神内耗。", dimension: "健康", subDimension: "压力内耗", reversed: false },
  { id: 12, text: "我经常过度担忧未来，陷入焦虑。", dimension: "健康", subDimension: "压力内耗", reversed: true },

  // ===== 事业 =====
  { id: 13, text: "我当前岗位工作内容稳定，变动风险小。", dimension: "事业", subDimension: "生存安稳", reversed: false },
  { id: 14, text: "我很少有强烈的失业焦虑和职业不安全感。", dimension: "事业", subDimension: "生存安稳", reversed: false },
  { id: 15, text: "我经常担心失业，缺乏职业安全感。", dimension: "事业", subDimension: "生存安稳", reversed: true },
  { id: 16, text: "我的工作时间精力付出，与薪资收入基本匹配。", dimension: "事业", subDimension: "回报匹配", reversed: false },
  { id: 17, text: "我对当前薪酬回报整体认可度比较高。", dimension: "事业", subDimension: "回报匹配", reversed: false },
  { id: 18, text: "我的付出和收入不太对等，性价比偏低。", dimension: "事业", subDimension: "回报匹配", reversed: true },
  { id: 19, text: "我和同事相处简单融洽，少有勾心斗角内耗。", dimension: "事业", subDimension: "职场环境", reversed: false },
  { id: 20, text: "我与上级沟通顺畅，管理风格容易适应。", dimension: "事业", subDimension: "职场环境", reversed: false },
  { id: 21, text: "职场人际关系让我消耗很多心力。", dimension: "事业", subDimension: "职场环境", reversed: true },
  { id: 22, text: "当前工作能持续让我学到新技能与专业能力。", dimension: "事业", subDimension: "职业成长", reversed: false },
  { id: 23, text: "我对自身长期职业发展前景抱有信心。", dimension: "事业", subDimension: "职业成长", reversed: false },
  { id: 24, text: "我看不到清晰的晋升路径，职业发展迷茫。", dimension: "事业", subDimension: "职业成长", reversed: true },

  // ===== 财务 =====
  { id: 25, text: "我对日常收支有大致概念，花钱有分寸感。", dimension: "财务", subDimension: "理性消费", reversed: false },
  { id: 26, text: "我消费较为理性，很少冲动购物跟风消费。", dimension: "财务", subDimension: "理性消费", reversed: false },
  { id: 27, text: "我经常冲动购物，容易跟风消费。", dimension: "财务", subDimension: "理性消费", reversed: true },
  { id: 28, text: "我有一定备用存款，能应对临时突发支出。", dimension: "财务", subDimension: "应急储备", reversed: false },
  { id: 29, text: "我有固定储蓄习惯，每月能留存部分收入。", dimension: "财务", subDimension: "应急储备", reversed: false },
  { id: 30, text: "我几乎没有存款，遇到急事会捉襟见肘。", dimension: "财务", subDimension: "应急储备", reversed: true },
  { id: 31, text: "我整体负债规模合理，没有过度债务堆积。", dimension: "财务", subDimension: "负债压力", reversed: false },
  { id: 32, text: "债务带给我的心理压力整体可控、不煎熬。", dimension: "财务", subDimension: "负债压力", reversed: false },
  { id: 33, text: "我经常为债务感到焦虑和压力。", dimension: "财务", subDimension: "负债压力", reversed: true },
  { id: 34, text: "我有基础固定资产或长期资产积累。", dimension: "财务", subDimension: "资产配置", reversed: false },
  { id: 35, text: "我有基础理财意识，不把资金完全闲置。", dimension: "财务", subDimension: "资产配置", reversed: false },
  { id: 36, text: "我完全没有资产积累，也没有理财规划。", dimension: "财务", subDimension: "资产配置", reversed: true },

  // ===== 关系 =====
  { id: 37, text: "原生家庭整体相处氛围和睦温暖。", dimension: "关系", subDimension: "家庭氛围", reversed: false },
  { id: 38, text: "我能从家庭中获得理解与精神情感支持。", dimension: "关系", subDimension: "家庭氛围", reversed: false },
  { id: 39, text: "家庭氛围让我感到压抑或冷漠。", dimension: "关系", subDimension: "家庭氛围", reversed: true },
  { id: 40, text: "我承担的长辈赡养责任适度，不过度捆绑。", dimension: "关系", subDimension: "责任负担", reversed: false },
  { id: 41, text: "家庭整体责任负担，不会过度消耗个人生活。", dimension: "关系", subDimension: "责任负担", reversed: false },
  { id: 42, text: "家庭责任让我感到沉重和疲惫。", dimension: "关系", subDimension: "责任负担", reversed: true },
  { id: 43, text: "我与孩子日常相处融洽，少有激烈冲突。", dimension: "关系", subDimension: "亲子关系", reversed: false },
  { id: 44, text: "我能保证高质量陪伴，不只是形式上在场。", dimension: "关系", subDimension: "亲子关系", reversed: false },
  { id: 45, text: "我常常不知道如何与孩子沟通相处。", dimension: "关系", subDimension: "亲子关系", reversed: true },
  { id: 46, text: "我在伴侣关系里内心安稳，少有患得患失。", dimension: "关系", subDimension: "伴侣关系", reversed: false },
  { id: 47, text: "彼此价值观契合，日常相处舒服不累。", dimension: "关系", subDimension: "伴侣关系", reversed: false },
  { id: 48, text: "我在伴侣关系中经常感到不安或疲惫。", dimension: "关系", subDimension: "伴侣关系", reversed: true },

  // ===== 休闲 =====
  { id: 49, text: "我拥有稳定的兴趣爱好，充实精神生活。", dimension: "休闲", subDimension: "兴趣爱好", reversed: false },
  { id: 50, text: "投入爱好时能放松身心，脱离生活压力。", dimension: "休闲", subDimension: "兴趣爱好", reversed: false },
  { id: 51, text: "我没有什么兴趣爱好，生活比较单调。", dimension: "休闲", subDimension: "兴趣爱好", reversed: true },
  { id: 52, text: "我会适时出行游历，拓宽眼界和生活阅历。", dimension: "休闲", subDimension: "阅历体验", reversed: false },
  { id: 53, text: "我愿意尝试新鲜事物，不固守单一生活模式。", dimension: "休闲", subDimension: "阅历体验", reversed: false },
  { id: 54, text: "我很少出门体验新鲜事物，生活一成不变。", dimension: "休闲", subDimension: "阅历体验", reversed: true },
  { id: 55, text: "我身边有三观同频、能深度交流的好友。", dimension: "休闲", subDimension: "朋友知己", reversed: false },
  { id: 56, text: "我拥有真诚相待、可以托付心事的朋友。", dimension: "休闲", subDimension: "朋友知己", reversed: false },
  { id: 57, text: "我身边缺少可以深度交流的朋友。", dimension: "休闲", subDimension: "朋友知己", reversed: true },
  { id: 58, text: "我有清晰社交边界，敢于拒绝无意义应酬。", dimension: "休闲", subDimension: "人脉关系", reversed: false },
  { id: 59, text: "我能区分有效人脉与无效社交，精力不被浪费。", dimension: "休闲", subDimension: "人脉关系", reversed: false },
  { id: 60, text: "我经常被迫参加无意义的社交应酬。", dimension: "休闲", subDimension: "人脉关系", reversed: true },

  // ===== 成长 =====
  { id: 61, text: "我清晰了解自身性格优点与短板。", dimension: "成长", subDimension: "心性品格", reversed: false },
  { id: 62, text: "我有自身原则底线，不轻易随波逐流。", dimension: "成长", subDimension: "心性品格", reversed: false },
  { id: 63, text: "我容易随波逐流，缺乏自己的原则。", dimension: "成长", subDimension: "心性品格", reversed: true },
  { id: 64, text: "我清楚自己想要的生活状态与人生走向。", dimension: "成长", subDimension: "目标追求", reversed: false },
  { id: 65, text: "我有中长期生活目标，不随日子漂流。", dimension: "成长", subDimension: "目标追求", reversed: false },
  { id: 66, text: "我经常感到迷茫，不知道自己要什么。", dimension: "成长", subDimension: "目标追求", reversed: true },
  { id: 67, text: "我遇事有独立判断，不易被他人观点带偏。", dimension: "成长", subDimension: "认知思考", reversed: false },
  { id: 68, text: "我习惯定期复盘过往，总结得失修正选择。", dimension: "成长", subDimension: "认知思考", reversed: false },
  { id: 69, text: "我很少反思和复盘自己的经历。", dimension: "成长", subDimension: "认知思考", reversed: true },
  { id: 70, text: "我具备基本自律执行力，能推进该做的事。", dimension: "成长", subDimension: "能力提升", reversed: false },
  { id: 71, text: "我愿意持续学习新知识、新技能、新认知。", dimension: "成长", subDimension: "能力提升", reversed: false },
  { id: 72, text: "我缺乏自律，很多事拖到最后一刻。", dimension: "成长", subDimension: "能力提升", reversed: true },
];

export const options = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "很不符合" },
  { value: 3, label: "有点不符合" },
  { value: 4, label: "中立" },
  { value: 5, label: "有点符合" },
  { value: 6, label: "很符合" },
  { value: 7, label: "完全符合" },
];

export const TOTAL_QUESTIONS = 72;
export const MAX_SCORE = 504;
export const MAX_PER_DIMENSION = 84;