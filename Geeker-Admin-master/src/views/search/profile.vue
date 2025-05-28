<template>
  <div class="profile-main-container">
    <!-- 左侧主内容区（两列包裹） -->
    <div class="profile-main card">
      <div class="profile-left">
        <!-- 个人卡片 -->
        <div class="profile-card">
          <!-- 头像、姓名、学校等 -->
        </div>
        <!-- 个人简介、教育背景、工作经历 -->
        <div class="profile-section">
          <!-- 个人简介 -->
        </div>
        <div class="profile-section">
          <!-- 教育背景 -->
        </div>
        <div class="profile-section">
          <!-- 工作经历 -->
        </div>
      </div>
      <div class="profile-center">
        <!-- 研究关键图表 -->
        <div class="profile-research">
          <!-- 图表区域 -->
        </div>
        <!-- 论文列表 -->
        <div class="profile-papers">
          <!-- 论文条目 -->
        </div>
      </div>
    </div>
    <!-- 右侧侧边栏 -->
    <div class="profile-right card">
      <!-- 作者统计雷达图 -->
      <div class="profile-stats">
        <!-- 雷达图 -->
      </div>
      <!-- 合作者列表 -->
      <div class="profile-collaborators">
        <!-- 合作者条目 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-main-container {
  width: 1440px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 32px;
  background: #f5f6fa;
  min-height: 100vh;
}

/* 左侧主内容区整体卡片效果 */
.profile-main {
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: 1080px;
}

/* 个人信息列 */
.profile-left {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 内容列 */
.profile-center {
  width: 760px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 右侧侧边栏单独卡片 */
.profile-right {
  width: 340px;
  margin-left: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用样式 */
.profile-card,
.profile-section,
.profile-research,
.profile-papers,
.profile-stats,
.profile-collaborators {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 24px 20px;
}
</style>