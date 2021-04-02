<template>
  <div>
    <div>
      <el-row>
        <el-table
          :data="tableData"
          @row-click="clickTr"
          style="width: 100%">
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
    <div></div>
    <div></div>
  </div>
</template>

<script>

  export default {
    name:"Index",
    methods: {
      getProjects() {
        this.$axios.get(`${this.gitHost}/api/v4/projects?all=true&since=2021-03-17&per_page=1000`).then((response) => {
          this.tableData = response.data;
        })
      },
      clickTr(row){
        console.log(row)
        let d = new Date();
        let date = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()-1}`;
        this.$axios.get(`${this.gitHost}/api/v4/projects/${row.id}/repository/commits?all=true&since=${date}&per_page=1000&order=topo`).then((response) => {
          let commits = response.data.filter(item=> item.committer_name == 'yangzh')
          console.log(commits)
        })
      }
    },
    data() {
      return {
        tableData: [],
        gitHost: '',
      }
    },
    mounted () {
      this.gitHost = 'http://10.10.4.135';
      console.log(localStorage.getItem('token'));
      if(localStorage.getItem('token') == undefined){
        debugger
        this.$router.push({ path: 'login' });
      }
      this.getProjects();
    },
  }
</script>

<style lang="scss" scoped>

</style>