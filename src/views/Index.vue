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
      direction="rtl"
      :with-header="false"
      class="tl">
      <el-collapse id="drawDiv" v-model="activeNames" v-for="(commit, index) in weekCommits" :key="commit.date">
        <el-collapse-item :name="index">
          <template slot="title">
            <span class="date_title">{{commit.date}}</span>
            <!-- <i class="header-icon el-icon-info"></i> -->
          </template>
          <ul v-for="(item, idx) in commit.commitMsg" :key="idx">
            <li><i class="el-icon-close" @click="delCommit(index, idx)"></i>{{idx+1}}. {{item.message}}</li>
          </ul>
          
        </el-collapse-item>
      </el-collapse>
      <!-- <div v-for="(commit, index) in weekCommits" :key="index">
        {{ index }} 
      </div> -->
      <!-- <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(commit, index) in weekCommits"
          :key="index"
          :timestamp="commit.date">
          {{commit.commitMsg}}
        </el-timeline-item>
      </el-timeline> -->
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
      monday(date){
        var nowTime = date.getTime() ;
        var day = date.getDay() || 7;//周一是每周的第一天
        //var day = date.getDay() //周日是每周的第一天
        var oneDayTime = 24*60*60*1000 ;

        var Monday = nowTime - (day-1)*oneDayTime ;
        var mondayTime=new Date(Monday);

        var year=mondayTime.getFullYear();
        var monMath=mondayTime.getMonth()+1;
        var month=(monMath<10) ? "0"+""+monMath+"" : monMath;
        var data=(mondayTime.getDate()<10) ? "0"+""+mondayTime.getDate()+"" : mondayTime.getDate();
        var mondayDate=""+year+"-"+month+"-"+data+""
        return mondayDate;
      },
      getCommits(projectId, page){
        let _this = this;
        if(undefined === page){
          page = 1;
        }
        let d = this.monday(new Date());
        return new Promise((resolve, reject) => {
           _this.$axios.get(`${this.gitHost}/api/v4/projects/${projectId}/repository/commits?all=true&since=${d}&per_page=100&page=${page}`).then((response) => {
            let headers = response.headers;
            let nextPage = headers['x-next-page'];
            let commits = response.data.filter(item=> item.committer_name == 'yangzh');
            _this.projectCommits = _this.projectCommits.concat(commits);
            if(!!headers['x-next-page']){
              resolve(_this.getCommits(projectId, nextPage));
            }else{
              resolve(_this.projectCommits);
            }
          })
        })
      },
      async clickTr(row){
        let _this = this;
        _this.weekCommits = [];
        _this.projectCommits = [];
        await _this.getCommits(row.id);
        _this.dealCommits(_this.projectCommits);
          _this.drawer = true;
        
      },
      dealCommits(commitResutls){
        let commits = commitResutls.filter(item=> item.committer_name == 'yangzh');
        console.log(commits)
        // 提交记录每天分组
        let groupCommits = this.groupBy(commits, (item)=> item.committed_date.substring(0,10) );
        let commitMsg = [];
        let keys = Object.keys(groupCommits);
        for (let index = 0; index < keys.length; index++) {
          const element = keys[index];
          let dayCommits = groupCommits[element];
          dayCommits.forEach(dcItem=> {
            let itemMsg = dcItem.message;
            let arr = itemMsg.split('(');
            if(arr.length <2){
              return dcItem;
            }
            let func = arr[0].trim().toLowerCase();
            dcItem.func = func;
            dcItem.message = arr[1].split(")")[0].trim(0);
          })
          dayCommits = dayCommits.filter(item=> this.funcs.includes(item.func));
          let msg = {
            date: element,
            commitMsg: dayCommits
          }
          commitMsg.push(msg);
        }
        commitMsg.sort((a, b)=>{
          return a.date.localeCompare(b.date);
        })
        //=============
        commits = commits.filter(item=> this.funcs.includes(item.func));
        commitMsg.push({
          date: 'week',
          commitMsg: commits,
        });
        this.weekCommits = commitMsg;
        console.log(this.weekCommits);
      },
      groupBy(list, fn){
        let groups = [];
        list.forEach(element => {
          let group = fn(element);
          groups[group] = groups[group] || [];
          groups[group].push(element);
        });
        return groups;
      },
      delCommit(index, commitIndex){
        this.weekCommits[index].commitMsg.splice(commitIndex,1)

      },
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
        weekCommits: [],
        activeNames: [0],
        projectCommits: [],
        funcs: ['added','changed','fixed']
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
*{ margin:0; padding:0; }
.text {
  font-size: 14px;
  font-weight: bolder;
}

.item {
  padding: 18px 0;
}

.box-card {
  width: 480px;
}
.tl{
  text-align: left;
}
.date_title{
  margin-left: 10px;
}
ul{
  list-style: none;
}
ul li {
  padding-left: 10px;
}
/* #drawDiv ul li:hover{
  background: rgba(217, 224, 226, 0.933);
} */
i.el-icon-close{
  cursor: pointer;
}

/*1.显示滚动条：当内容超出容器的时候，可以拖动：*/
.el-drawer__body {
  overflow: auto;
  /* overflow-x: auto; */
}
 
/*2.隐藏滚动条，太丑了*/
.el-drawer__container ::-webkit-scrollbar{
  display: none;
}
</style>