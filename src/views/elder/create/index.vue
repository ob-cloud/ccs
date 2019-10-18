<template>
  <div>
    <el-form ref="elderForm" :rules="elderModelRules" :model="elderModel" label-width="100px">
        <el-tabs v-model="activeTab" type="card" class="elder">
          <el-tab-pane label="基础资料" name="basic" class="basic">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="老人编码" prop="id">
                  <el-input class="caption-item gutter w8" placeholder="老人编码" disabled v-model="elderModel.id"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="老人姓名" prop="name">
                  <el-input class="caption-item gutter w8" placeholder="老人姓名" v-model="elderModel.name"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="性别" prop="gender">
                  <el-select clearable class="caption-item gutter" placeholder="性别" v-model="elderModel.gender">
                    <el-option label='男' :value='0'></el-option>
                    <el-option label='女' :value='1'></el-option>
                    <el-option label='其他' :value='2'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="民族" prop="nation">
                  <el-select clearable class="caption-item gutter" placeholder="民族" v-model="elderModel.nation">
                    <el-option :label='item.name' :value='item.code' v-for="(item, index) in nationList" :key="index"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="身份证" prop="idcard">
                  <el-input class="caption-item gutter w8" placeholder="身份证" v-model="elderModel.idcard"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="出生日期" prop="birthday">
                  <el-date-picker
                    class="caption-item gutter"
                    v-model="elderModel.birthday"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="选择出生日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="年龄" prop="age">
                  <el-input class="caption-item gutter w8" placeholder="年龄" v-model="elderModel.age"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="家庭固话" prop="telephone">
                  <el-input class="caption-item gutter w8" placeholder="家庭固话" v-model="elderModel.telephone"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="手机号码" prop="phoneNumber">
                  <el-input class="caption-item gutter w8" placeholder="手机号码" v-model="elderModel.phoneNumber"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="血型" prop="bloodType">
                  <el-select clearable class="caption-item gutter" placeholder="血型" v-model="elderModel.bloodType">
                    <el-option :label='item.name' :value='item.code' v-for="(item, index) in bloodTypeList" :key="index"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="政治面貌" prop="politics">
                  <el-select clearable class="caption-item gutter" placeholder="政治面貌" v-model="elderModel.politics">
                    <el-option label='党员' value='党员'></el-option>
                    <el-option label='群众' value='群众'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="文化程度" prop="education">
                  <el-select clearable class="caption-item gutter" placeholder="文化程度" v-model="elderModel.education">
                    <el-option label='博士' value='博士'></el-option>
                    <el-option label='硕士' value='硕士'></el-option>
                    <el-option label='本科' value='本科'></el-option>
                    <el-option label='大专' value='大专'></el-option>
                    <el-option label='中学' value='中学'></el-option>
                    <el-option label='-' value='-'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col>
                <el-form-item label="户籍地址" prop="birthplace">
                  <el-input class="caption-item" placeholder="户籍地址" v-model="elderModel.birthplace"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

             <el-row>
              <el-col>
                <el-form-item label="居住地址" prop="address">
                  <el-input class="caption-item" placeholder="居住地址" v-model="elderModel.address"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="10">
              <el-col :span="8">
                 <el-form-item label="原职业" prop="occupation">
                  <el-input class="caption-item gutter" placeholder="原职业" v-model="elderModel.occupation"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                 <el-form-item label="介绍人" prop="introducer">
                  <el-input class="caption-item gutter" placeholder="介绍人" v-model="elderModel.introducer"></el-input>
                </el-form-item>
              </el-col>
               <el-col :span="8">
                 <el-form-item label="入院时间" prop="checkInTime">
                  <el-date-picker
                    class="caption-item gutter"
                    v-model="elderModel.checkInTime"
                    type="date"
                    value-format="yyyy-MM-dd"
                    placeholder="选择入院时间">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col>
                <el-form-item label="病史介绍">
                  <el-checkbox-group v-model="medicalHistory" size="small">
                    <el-checkbox class="checkbox" border v-for="item in medicalList" :label="item.code" :key="item.id">{{item.name}}</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <!-- <el-tab-pane label="联系人信息" name="contact">

          </el-tab-pane> -->
          <el-tab-pane label="入院信息" name="checkin">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入入院信息"
              v-model="elderModel.admissionMsg">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="服务需求" name="serviceDemand">
             <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入服务需求"
              v-model="elderModel.serviceDemand">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="用药医嘱" name="medicalAdvice">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入用药医嘱"
              v-model="elderModel.medicalAdvice">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="护理记录" name="nursingRecord">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入护理记录"
              v-model="elderModel.nursingRecord">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="就医记录" name="medialRecord">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入就医记录"
              v-model="elderModel.medialRecord">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="老人日程" name="agenda">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入老人日程"
              v-model="elderModel.agenda">
            </el-input>
          </el-tab-pane>
          <el-tab-pane label="零用金清单" name="pocketmoney">
            <el-input
              type="textarea"
              :rows="20"
              placeholder="请输入零用金清单"
              v-model="elderModel.pocketmoney">
            </el-input>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div class="footer">
        <el-button @click="close">取 消</el-button>
        <el-button type="primary" @click="createElder">确 认</el-button>
      </div>
  </div>
</template>

<script>
import SystemAPI from '@/api/system'
export default {
  props: {
    model: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      nationList: [],
      bloodTypeList: [],
      medicalList: [],
      activeTab: 'basic',
      elderModel: {
        id: '',
        name: '',
        gender: 0,
        nation: '',
        idcard: '',
        birthday: '',
        age: '',
        telephone: '',
        phoneNumber: '',
        bloodType: '',
        politics: '',
        education: '',
        birthplace: '',
        address: '',
        occupation: '',
        introducer: '',
        checkInTime: '',
        medicalHistory: [],
        admissionMsg: '',
        serviceDemand: '',
        medicalAdvice: '',
        nursingRecord: '',
        medicalRecord: '',
        agenda: '',
        pocketmoney: ''
      },
      medicalHistory: [],
      elderModelRules: {
        name: [{ required: true, trigger: 'blur', message: '姓名不能为空'}],
        gender: [{ required: true, trigger: 'blur', message: '性别不能为空'}],
        // nation: [{ required: true, trigger: 'blur', message: '民族不能为空'}],
        idcard: [{ required: true, trigger: 'blur', message: '身份证不能为空'}],
        birthday: [{ required: true, trigger: 'blur', message: '生日不能为空'}],
        age: [{ required: true, trigger: 'blur', message: '年龄不能为空'}],
        address: [{ required: true, trigger: 'blur', message: '居住地址不能为空'}]
      }
    }
  },
  mounted () {
    if (this.model) {
      this.elderModel = {...this.model}
    }
    this.getNationList()
    this.getBloodTypeList()
    this.getMedicalList()
  },
  methods: {
    getNationList () {
      SystemAPI.getNactionList().then(res => {
        if (res && res.code === 0) {
          this.nationList = res.data.records
        }
      })
    },
    getBloodTypeList () {
      SystemAPI.getBloodTypeList().then(res => {
        if (res && res.code === 0) {
          this.bloodTypeList = res.data.records
        }
      })
    },
    getMedicalList () {
      SystemAPI.getMedicalList().then(res => {
        if (res && res.code === 0) {
          this.medicalList = res.data.records
        }
      })
    },
    createElder () {
      this.$refs.elderForm.validate(valid => {
        if (valid) {
          this.$emit('data-ready', this.elderModel, false)
        }
      })
    },
    close () {
      this.$emit('close', false)
    }
  },
}
</script>

<style lang="scss" scoped>
.w8{
  width: 80%;
}
.caption-item.gutter{
  width: 100%;
}
.checkbox.el-checkbox.is-bordered.el-checkbox--small{
  margin-right: 10px;
  margin-left: 0!important;
}
.footer{
  padding: 20px 0;
  text-align: right;
}
</style>
