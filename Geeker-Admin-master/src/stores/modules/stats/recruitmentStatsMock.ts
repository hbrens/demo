import { faker } from '@faker-js/faker/locale/zh_CN';

// 基础类型定义
interface BaseRecruitment {
  id: string;
  name: string;
  lm: string;
  owner: string;
  status: string;
}

// 校招类型
interface CampusRecruitment extends BaseRecruitment {
  university: string;
  major: string;
  graduationYear: number;
  internshipPeriod?: string;
}

// 内转类型
interface InternalTransfer extends BaseRecruitment {
  currentDepartment: string;
  currentPosition: string;
  transferReason: string;
  yearsOfExperience: number;
}

// OD类型
interface ODRecruitment extends BaseRecruitment {
  company: string;
  projectDuration: string;
  skillSet: string[];
  expectedSalary: number;
}

// 博士后类型
interface PostDoc extends BaseRecruitment {
  researchField: string;
  publications: number;
  postDocInstitute: string;
  researchExperience: string;
}

// 通用状态
const STATUS_OPTIONS = ['招聘中', '沟通中', '已入职', '放弃', '待入职', '面试中'];

// 团队和负责人数据池
const TEAM_POOL = [
  '基础架构组',
  '前端开发组',
  '后端开发组',
  '算法组',
  '数据分析组',
  '产品组',
  'UI设计组',
  '测试组',
  '运维组',
  '安全组'
];

const OWNER_POOL = [
  '张经理',
  '李主管',
  '王总监',
  '刘经理',
  '陈主管',
  '黄经理',
  '赵组长',
  '孙经理',
  '吴主管',
  '郑经理'
];

// 生成基础数据
const generateBaseData = (): BaseRecruitment => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  lm: TEAM_POOL[Math.floor(Math.random() * TEAM_POOL.length)],
  owner: OWNER_POOL[Math.floor(Math.random() * OWNER_POOL.length)],
  status: STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)]
});

// 生成校招数据
export const generateCampusData = (count: number = 100): CampusRecruitment[] => {
  return Array.from({ length: count }, () => ({
    ...generateBaseData(),
    university: faker.location.city() + '大学',
    major: faker.helpers.arrayElement(['计算机科学', '软件工程', '数据科学', '人工智能', '信息安全']),
    graduationYear: faker.number.int({ min: 2024, max: 2026 }),
    internshipPeriod: faker.helpers.arrayElement(['3个月', '6个月', '无需实习'])
  }));
};

// 生成内转数据
export const generateInternalData = (count: number = 80): InternalTransfer[] => {
  return Array.from({ length: count }, () => ({
    ...generateBaseData(),
    currentDepartment: faker.helpers.arrayElement(['市场部', '销售部', '技术部', '运营部', '人力资源部']),
    currentPosition: faker.helpers.arrayElement(['产品经理', '开发工程师', '测试工程师', '运营专员', '销售经理']),
    transferReason: faker.helpers.arrayElement(['职业发展', '技能提升', '团队调整', '项目需要', '个人意愿']),
    yearsOfExperience: faker.number.int({ min: 1, max: 10 })
  }));
};

// 生成OD数据
export const generateODData = (count: number = 150): ODRecruitment[] => {
  return Array.from({ length: count }, () => ({
    ...generateBaseData(),
    company: faker.company.name(),
    projectDuration: faker.helpers.arrayElement(['3个月', '6个月', '12个月', '长期']),
    skillSet: faker.helpers.arrayElements(['React', 'Vue', 'Node.js', 'Python', 'Java', 'Go'], { min: 2, max: 4 }),
    expectedSalary: faker.number.int({ min: 20000, max: 50000 })
  }));
};

// 生成博士后数据
export const generatePostDocData = (count: number = 70): PostDoc[] => {
  return Array.from({ length: count }, () => ({
    ...generateBaseData(),
    researchField: faker.helpers.arrayElement(['机器学习', '分布式系统', '计算机视觉', '自然语言处理', '量子计算']),
    publications: faker.number.int({ min: 3, max: 15 }),
    postDocInstitute: faker.helpers.arrayElement(['中科院', '清华大学', '北京大学', '上海交大', '浙江大学']),
    researchExperience: faker.helpers.arrayElement(['3年', '4年', '5年', '6年'])
  }));
};

// 导出所有模拟数据
export const mockRecruitmentData = {
  campus: generateCampusData(),
  internal: generateInternalData(),
  od: generateODData(),
  postDoc: generatePostDocData()
};
