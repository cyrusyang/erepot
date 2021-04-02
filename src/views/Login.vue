<template>
  <div>
    {{this.code}}
  </div>
</template>

<script>
  import qs from 'qs'
  import {getToken} from '../render/gitauth'
  export default {
    name:"Login",
    methods: {
      init() {
        
      }
    },
    data() {
      return {
        gitHost: '',
        //auth 授权吗
        code: '',
        client_id: '',
        redirect_url: '',
        client_secret: '',
      }
    },
    mounted () {
      this.gitHost = 'http://10.10.4.135';
      let query=this.$route.query;
      this.client_id = 'fc0761376e90f332321c1371e4bdffaa942498f178488cbcfdfbb0586af40ad3';
      this.client_secret = '8121002fe6ccedfe58fc137c05158e74e45934dce2d8a05c227834fed3e0f972';
      if(localStorage.getItem('token') == undefined){
        this.code = query.code;
        debugger;
        if(!this.code){
          //向gitlab请求授权码
          
          this.redirect_url = 'http://localhost:8080/login';
          let auth_url = `${this.gitHost}/oauth/authorize?client_id=${this.client_id}&redirect_uri=${this.redirect_url}&response_type=code`;
          console.log(this.code);
          window.location.href = auth_url;
        }else{
          let req_token_url = `${this.gitHost}/oauth/token`;
          console.log(req_token_url);
          let params = {
            client_id: this.client_id,
            client_secret: this.client_secret,
            code: this.code,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:8080'
          };
          // getToken(JSON.stringify(params))
          
        }
      }else{
        // this.$router.push({path: '/'})
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>