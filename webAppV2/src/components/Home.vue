<template>
  <div class="background">
    <div class="common-layout">
      <el-header class="home-header">SolidRemote
        <div class="active-project-display" v-if="selectedProject !== null">
          {{ this.selectedProject.name }}
        </div>
      </el-header>
      <el-main>
        <grid-layout v-model:layout.sync="componentNames" :col-num="250" :row-height="1" :row-width="100"
          :is-draggable="true" :is-resizable="true" :responsive="false" :is-mirrored="false" :vertical-compact="false"
          :margin="[10, 10]" :use-css-transforms="true" :autoSize="true">
          <grid-item v-for="component in componentNames" :x="component.x" :y="component.y" :w="component.w"
            :h="component.h" :i="component.i" :key="component.i">
            <component v-bind:is="component.name" />
          </grid-item>
        </grid-layout>

        <el-dialog v-model="scriptDialogFormVisible" title="Edit Script">
          <el-form :model="form">
            <el-form-item label="Script name" :label-width="formLabelWidth">
              <el-input v-model="form.name" type="textarea" :rows="1" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Executable" :label-width="formLabelWidth">
              <el-select v-model="form.executableName" placeholder="Please select an executable name">
                <el-option v-for="loadedExec in loadedExecs" :key="loadedExec.name" :value="loadedExec.name"
                  :label="loadedExec.name" />
              </el-select>
            </el-form-item>
            <el-form-item label="Start Command Line Arguments" :label-width="fit-content">
              <el-input v-model="form.startArgs" type="textarea" :rows="1" autocomplete="off" />
            </el-form-item>
          </el-form>
          <el-form-item label="Stop Command Line Arguments" :label-width="fit-content">
            <el-input v-model="form.stopArgs" type="textarea" :rows="1" autocomplete="off" />
          </el-form-item>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="scriptDialogFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="(scriptDialogFormVisible = false), postChanges()">
                Confirm
              </el-button>
            </span>
          </template>
        </el-dialog>
        <el-dialog v-model="newProjectFormVisible" title="New Project">
          <el-form :model="projectForm">
            <el-form-item class="DialogScript" label="Project name" :label-width="formLabelWidth">
              <el-input v-model="projectForm.name" type="textarea" :rows="1" placeholder="Enter Project Name"
                autocomplete="off" />
            </el-form-item>
            <el-form-item class="DialogScript" label="Current Index" :label-width="formLabelWidth">
              <el-input-number v-model="projectForm.currentIndex" placeholder="0" :min="0" :max="99999" />
            </el-form-item>
            <el-form-item class="DialogScript" label="Current Project" :label-width="formLabelWidth">
              <el-checkbox v-model="projectForm.current" label="Active" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="newProjectFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="(newProjectFormVisible = false), addNewProject()">
                Confirm
              </el-button>
            </span>
          </template>
        </el-dialog>
      </el-main>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import IphonesList from "./Iphone.vue";
import ScriptsList from "./ScriptsList.vue";
import MainRemote from "./MainRemote.vue";
import ProjectsList from "./ProjectsList.vue";
import Notifications from "./Notifications.vue";
import VueGridLayout from "vue-grid-layout";

let form = reactive({
  name: "",
  executableName: "",
  startArgs: "",
  stopArgs: "",
});

let projectForm = reactive({
  id: "",
  name: "",
  currentIndex: "0",
  current: false,
});

const newProjectFormVisible = ref(false);
const scriptDialogFormVisible = ref(false);
const formLabelWidth = "140px";

export default {
  name: "SolidRemoteHome",
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    ScriptsList: ScriptsList,
    IphonesList: IphonesList,
    ProjectsList: ProjectsList,
    Notifications: Notifications,
    MainRemote: MainRemote,
  },
  created() {

    this.emitter.on('resizeCard', (evt) => {
      switch (evt) {
        case "ProjectsList":
          if (this.componentNames[1].h === 23) {
            this.componentNames[1].h = 9;
            this.componentNames[1].w = 28;
          } else {
            this.componentNames[1].h = 23;
            this.componentNames[1].w = 36;
          }
          break
        case "Notifications":
          if (this.componentNames[3].h === 28) {
            this.componentNames[3].h = 10;
          } else {
            this.componentNames[3].h = 28;
          }
          break
        case "ScriptsList":
          if (this.componentNames[2].h === 27) {
            this.componentNames[2].h = 10;
            this.componentNames[2].w = 25;
          } else {
            this.componentNames[2].h = 27;
            this.componentNames[2].w = 38;
          }
          break
        case "Iphones":
          if (this.componentNames[4].h === 9) {
            this.componentNames[4].h = 16;
          } else {
            this.componentNames[4].h = 9;
          }
          break
          default:
            break;
      }
    });

    // Listening for an event called "updateActiveProject" and when it is emitted, it sets the
    // selectedProject to the event.
    this.emitter.on("updateActiveProject", (evt) => {
      this.selectedProject = evt;
    });

    // Listening for an event called "openEditScript" and when it is emitted, it calls the function
    // openFileDialog.
    this.emitter.on("openEditScript", (evt) => {
      this.openFileDialog(evt);
    });

    this.emitter.on("refreshProjects", (evt) => {
      this.refreshProjects();
    });
    // Listening for an event called "openNewProjectForm" and when it is emitted, it sets the
    //       newProjectFormVisible to true.
    this.emitter.on("openNewProjectForm", () => {
      this.newProjectFormVisible = true;
    });
    this.emitter.on("confirmProjectDelete", (evt) => {
      this.showConfirmDelete = true;
    });
  },
  data() {
    return {
      componentNames: [
        { name: "MainRemote", x: 0, y: 0, w: 100, h: 31, i: "0", },
        { name: "ProjectsList", x: 6, y: 0, w: 36, h: 23, i: "1", },
        { name: "ScriptsList", x: 5, y: 0, w: 38, h: 29, i: "2", },
        { name: "Notifications", x: 47, y: 48, w: 33, h: 28, i: "3", },
        { name: "IphonesList", x: 50, y: 0, w: 29, h: 16, i: "4", },
      ],
      activeProjects: [],
      selectedProject: null,
      scriptDialogFormVisible,
      form,
      projectForm,
      newProjectFormVisible,
      formLabelWidth,
      loadedExecs: [],
      showConfirmDelete: false,
    };
  },
  async mounted() {
    let self = this;
    // Fetching data from the server.
    const projectData = await fetch("http://localhost:3000/projects");
    const execData = await fetch("http://localhost:3000/execs");
    const newExecData = await execData.json();
    const newProjectData = await projectData.json();
    this.loadedExecs = newExecData;
    this.activeProjects = newProjectData;

    // Checking if the current project is active.
    for (let i = 0; i < this.activeProjects.length; i++) {
      if (this.activeProjects[i].current === true) {
        this.selectedProject = this.activeProjects[i];
      }
    }
  },
  methods: {
    // A method that is called when the user clicks on the save button. It sends changes made to selected script to the server
    postChanges() {
      let newData = this.form.script;
      if (this.form.name !== newData.name) {
        newData.name = this.form.name;
      }
      if (this.form.executableName !== newData.executableName) {
        newData.executableName = this.form.executableName;
      }
      if (this.form.startArgs !== newData.startArgs) {
        newData.startArgs = this.form.startArgs;
        newData.startTokens = this.form.startArgs.split(' ');
      }
      if (this.form.stopArgs !== newData.stopArgs) {
        newData.stopArgs = this.form.stopArgs;
        newData.stopTokens = this.form.stopArgs.split(' ');
      }
      let id = newData.id;
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Connection: "keep-alive",
        },
        body: JSON.stringify(newData),
      };
      fetch("http://localhost:3000/scripts/" + id, requestOptions);
    },

    // A function that is called when the user clicks the confirm button in the new project form. It checks
    // if the current project is active and if it is, it emits an event called refreshProjects. If it is
    // not active, it sends a POST request to the server and then emits an event called refreshProjects.
    addNewProject() {
      if (this.projectForm.current === true) {
        this.emitter.emit("refreshProjects", this.projectForm);
        return;
      }
      let requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Connection": "keep-alive"
        },
        body: JSON.stringify(this.projectForm)
      };
      fetch('http://localhost:3000/projects/', requestOptions);
      this.emitter.emit("refreshProjects", this.projectForm);
    },

    // Setting the form to the event that is passed in.
    openFileDialog(evt) {
      this.scriptDialogFormVisible = true;
      this.form.name = evt.name;
      this.form.executableName = evt.executableName;
      this.form.startArgs = evt.startArgs;
      this.form.stopArgs = evt.stopArgs;
      this.form.id = evt.id;
      this.form.script = evt;
      if (this.form.name === null) {
        form = {
          name: undefined,
          executableName: undefined,
          startArgs: undefined,
          stopArgs: undefined,
          id: 0,
          script: undefined,
        };
      }
    },

    // Fetching data from the server and then setting the activeProjects to the new data. It then
    // checks if the current project is active and if it is, it sets the selectedProject to the current
    // project. It then returns the selectedProject.
    async refreshProject() {
      const data = await fetch("http://localhost:3000/projects");
      const newData = await data.json();
      this.activeProjects = newData;
      for (let i = 0; i < this.activeProjects.length; i++) {
        if (this.activeProjects[i].current === true) {
          this.selectedProject = this.activeProjects[i];
          this.$globalActiveProject = this.selectedProject;
        }
      }
      return this.selectedProject;
    },
  },
};
</script>

<style>
@import "./styles/style.css";
@import "./styles/record-button.css";
@import "./styles/project.css";
@import "./styles/deploy-component-btn.css";
@import "./styles/script.css";
@import "./styles/main-card.css";
@import "./styles/header.css";
@import "./styles/notifications.css";
</style>
