<template>
  <div>
    <div>
      <el-row>
        <el-table
          :data="tableData"
          @row-click="clickTr"
          style="width: 100%">
          <el-table-column
            type="index">
          </el-table-column>
          <el-table-column
            prop="name_with_namespace"
            label="项目"
            width="250">
          </el-table-column>
          <el-table-column
            prop="description"
            label="地址">
          </el-table-column>
        </el-table>
      </el-row>
    </div>
    <el-drawer
      :visible.sync="drawer"
      size='50%'
      direction="rtl">
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(commit, index) in projectCommits"
          :key="index"
          :timestamp="commit.committed_date">
          {{commit.message}}
        </el-timeline-item>
      </el-timeline>
    </el-drawer>
    <div>
      
    </div>
    <div></div>
  </div>
</template>

<script>

  export default {
    name:"Index",
    methods: {
      getProjects() {
        this.$axios.get(`${this.gitHost}/api/v4/projects?per_page=1000`).then((response) => {
          this.tableData = response.data;
        })
      },
      clickTr(row){
        console.log(row)
        let d = new Date();
        let date = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        this.$axios.get(`${this.gitHost}/api/v4/projects/${row.id}/repository/commits?all=true&since=${date}&per_page=1000&order=topo`).then((response) => {
          let commits = response.data.filter(item=> item.committer_name == 'yangzh')
          console.log(commits)
          this.projectCommits = commits
          this.drawer = true;
        })
      }
    },
    data() {
      return {
        tableData: [],
        gitHost: '',
        token: '',
        reverse: true,
        activities: [{
          content: '活动按期开始',
          timestamp: '2018-04-15'
        }, {
          content: '通过审核',
          timestamp: '2018-04-13'
        }, {
          content: '创建成功',
          timestamp: '2018-04-11'
        }],
        drawer: false,
        projectCommits: [],
      }
    },
    mounted () {
      this.gitHost = 'http://10.10.4.135';
      console.log(localStorage.getItem('token'));
      if(localStorage.getItem('token') == undefined){
        this.$router.push({ path: 'login' });
      }
      this.token = localStorage.getItem('token');
      this.$axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      this.getProjects();
    },
  }
</script>

<style>
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}

.box-card {
  width: 480px;
}
</style>