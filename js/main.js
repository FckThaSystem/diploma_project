document.addEventListener('DOMContentLoaded', function () {
    // reg and auth init
        getJsonSetLocal();
        let regBtn = document.querySelector('header .user_settings .registration');
        registration(regBtn);
        let authBtn = document.querySelector('header .user_settings .authorization');
        authorization(authBtn);
        renderAuthUserBlock();
        getTheme();
        let myProjectsBtn = document.querySelector('header .menu_left .my_projects');
        myProjectsBtn.addEventListener('click', function (e) {
            renderProjectsList();
        })
        let homeBtn = document.querySelector('.home.default_btn');
        homeBtn.addEventListener('click', function (e) {
            let mainPage = mainPageContent();
            renderPage(mainPage)
            rememberContent()
        })
        if(sessionStorage.getItem('remember')){
            let localRemember = JSON.parse(sessionStorage.getItem('remember'));
            switch (localRemember.page) {
                case 'project_list':
                    renderProjectsList();
                    break;
                case 'project_data':
                    loadTasks(localRemember['project_id'], localRemember['task_select']);
                    break;
                case 'task_data':

                    break;
                default:
                    let mainPage = mainPageContent();
                    renderPage(mainPage)
            }
        }else{
            // render main page content
            let mainPage = mainPageContent();
            renderPage(mainPage)
        }


})

function rememberContent(name, id, type, selectVal) {
    console.log(selectVal, type)
    let loadObj = {
        page: name,
        project_id: id != undefined && type === 'project'? id : 0,
        task_id: id != undefined && type === 'task'? id : 0,
        task_select: selectVal != undefined ? selectVal : 1
    }
    sessionStorage.setItem('remember', JSON.stringify(loadObj));
}

function getTheme() {
    let localTheme = getLocalData('theme');
    let themeBlock = document.getElementById('theme');
    let themeObj = { theme: 2 }
    if (!localTheme) {
        setLocalItem('theme', themeObj)
        document.body.classList.add('bright_mode');
        document.body.classList.remove('dark_mode');
        themeBlock.value = 2;
    } else {
        console.log(localTheme)
        if (localTheme.theme === 1) {
            document.body.classList.remove('bright_mode');
            document.body.classList.add('dark_mode');
            themeBlock.value = 1;
        } else {
            document.body.classList.add('bright_mode');
            document.body.classList.remove('dark_mode');
            themeBlock.value = 2;
        }
    }
    themeBlock.addEventListener('change', function (e) {
        setTheme(themeBlock, localTheme)
    });

}

function setTheme(item, local) {
    let thisValue = item.value;
    if (thisValue === '1') {
        document.body.classList.remove('bright_mode');
        document.body.classList.add('dark_mode');
        local.theme = +thisValue;
        setLocalItem('theme', local);
    } else {
        document.body.classList.add('bright_mode');
        document.body.classList.remove('dark_mode');
        local.theme = +thisValue;
        setLocalItem('theme', local);
    }
}

// get from local
function getLocalData(name) {
    return JSON.parse(localStorage.getItem(name));
}

// set to local
function setLocalItem(name, item) {
    localStorage.setItem(name, JSON.stringify(item))
}

function getLocalUser() {
    return localStorage.getItem('user_logged') ? JSON.parse(localStorage.getItem('user_logged')) : JSON.parse(sessionStorage.getItem('user_logged'))
}

function mainPageContent() {
    let localUser = getLocalUser();
    let localProjects = getLocalData('projects_data');
    if(localUser){
        let setter = getTasks('setter');
        let executor = getTasks('executor');
        let completed = executor.filter(function (item) {
            if(item.status === 2){
                return item
            }
        })
        function getTasks(name){
          let newArr = [];
          localProjects.forEach((project)=>{
               console.log(project['project_id'], project)
               project['tasks'].filter(function (item) {
                    if(item['users'][name]['id'] === localUser.id){
                        newArr.push(item)
                    }
                })
            })
            return newArr
        }
        console.log(completed)
        let sex = '';
        localUser.sex === 'male' ? sex = 'мужской' : 'женский';
        var homeHtml = `<h2 style="text-align: center; margin: 15px 0">Данные пользователя</h2>
                        <div class="default_box" style="margin: 0 auto">
                        <h3>Информация</h3><br>
                        <span class="default_box-row">
                        <span class="flex_column_block" style="align-items: flex-start">
                        <span><b style="margin-right: 10px">Имя:</b>${localUser.name}</span>
                        <span><b style="margin-right: 10px">E-mail:</b> ${localUser.email}</span>
                        <span><b style="margin-right: 10px">Дата рождения:</b> ${localUser.birthday}</span>
                        <span><b style="margin-right: 10px">Пол:</b> ${sex}</span><br>
                        </span>
                        <img src="${localUser.avatar}">
                        </span>
                        <h3>Статистика</h3><br>
                        <span class="default_box-row">
                        <span><b>Количество проектов:</b> ${localUser.projects.length}</span>
                        <span><b>Поставлено задач:</b> ${setter.length}</span>
                        <span><b>Выполнено задач:</b> ${completed.length}</span>
                        </span>
                        </div>`
    }else{
        var homeHtml = `<div class="default_box">
                        <h3>Здравствуйте, Гость!</h3>
                        <p>Добро пожаловать в наше приложение</p>
                        <p>Пройдите <a class="home_page_link" onclick="registration(this);">регистрацию</a> или <a onclick="authorization(this);" class="home_page_link">авторизуйтесь</a>, если у вас уже есть учетная запись</p>
                        </div>`
    }
    return homeHtml
}

//render page
function renderPage(html) {
    var block = document.querySelector('.main_container')
    block.innerHTML = html;
}

function getDataJson(url) {
    let jsonData = fetch(url).then((response) => {
        return response.json();
    }).then((data) => {
        return data;
    }).catch((e) => {
        console.log(e)
        alert('Ой, произошла ошибка при загрузке данных, пожалуйста, обратитесь к администратору!');
    })
    return jsonData
}

function getJsonSetLocal() {
    if (!localStorage.getItem('users_data')) {
        getDataJson('json/users.json').then((response) => {
            setLocalItem('users_data', response)
        })
    }
    if (!localStorage.getItem('projects_data')) {
        getDataJson('json/projects.json').then((response) => {
            setLocalItem('projects_data', response)
        })
    }
    if (!localStorage.getItem('main')) {
        getDataJson('json/main.json').then((response) => {
            setLocalItem('main', response)
        })
    }
}

// registration
function registration(btn) {
    let submitBtn = document.querySelector('#modal_registration .submit_reg');
    let modalRegistration = document.querySelector('#modal_registration.modal');
    function submitReg(){
        let inputs = document.querySelectorAll('#modal_registration .modal_body input');
        let errorBlock = document.querySelector('#modal_registration .modal_error ul');
        let usersLocal = getLocalData('users_data');
        let validateArr = [];
        let newUser = {
            id: 0,
            name: "",
            email: "",
            password: "",
            sex: "",
            birthday: "",
            avatar: "",
            projects: [],
            setter: [],
            executor: [],
            observer: []
        };
        errorBlock.innerHTML = '';
        inputs.forEach(function (item) {
            if (item.name === 'name') {
                if (item.value.length < 3) {
                    validateArr.push(false)
                    errorBlock.innerHTML += `<li>Поле "Имя" должно содержать минимум 3 символа</li>`
                } else {
                    validateArr.push(true)
                    newUser[item.name] = item.value;
                }
            }
            if (item.name === 'email') {
                let usersEmailArr = usersLocal.map(function (item) {
                    return item['email']
                })
                item.value = item.value.replace(/'[а-яА-Я ]'/g, '');
                if (item.value.indexOf('@') === -1 || item.value.length < 6) {
                    validateArr.push(false)
                    errorBlock.innerHTML += `<li>Поле "E-mail" заполнено некорректно</li>`
                } else if (usersEmailArr.includes(item.value)) {
                    validateArr.push(false)
                    console.log('Аккаунт с таким E-mail уже зарегистрирован')
                    errorBlock.innerHTML += `<li>Аккаунт с таким E-mail уже зарегистрирован</li>`
                } else {
                    validateArr.push(true)
                    newUser[item.name] = item.value;
                }
            }
            if (item.name === 'birthday') {
                if (!item.value) {
                    validateArr.push(false)
                    errorBlock.innerHTML += `<li>Введите дату рождения</li>`
                } else {
                    validateArr.push(true)
                    newUser[item.name] = item.value;
                }
            }
            if (item.name === 'password') {
                item.value = item.value.replace(/'[а-яА-Я ]'/g, '')
                if (item.value.length < 8) {
                    validateArr.push(false);
                    errorBlock.innerHTML += `<li>Пароль должен состоять минимум из 8 символов</li>`
                } else {
                    validateArr.push(true)
                    newUser[item.name] = item.value;
                }
            }
            if (item.name === 'sex') {
                if (item.checked === true) {
                    validateArr.push(true)
                    newUser[item.name] = item.value;
                }
            }
        })
        if (validateArr.indexOf(false) !== -1) {
            let errorParent = errorBlock.parentNode;
            errorParent.style.display = 'block';
        } else {
            let mainArr = getLocalData('main')[0];
            console.log(mainArr)
            let usersCount = +mainArr['users_count']++
            console.log(usersCount);
            newUser.id = usersCount[0];
            usersLocal.push(newUser);
            setMainCount('user');
            setLocalItem('users_data', usersLocal);
            closeModal(modalRegistration);
            submitBtn.removeEventListener('click', submitReg);
            inputs.forEach(function (item) {
                item.value = '';
            })
            let modalSuccess = document.querySelector('#modal_success');
            modalSuccess.querySelector('.modal_body').innerHTML = `<i style="color:#3f87a6; font-size: 2em; margin: 0 auto;" class="fa fa-check-square-o" aria-hidden="true"></i><p style="margin-top: 10px"><span style="font-weight: 900">${newUser.name}</span>, спасибо за регистрацию! Регистрация успешна!</p>`;
            modalSuccess.classList.add('modal_active');
            setTimeout(() => {
                closeModal(modalSuccess);
            }, 2000)
        }
    }
    btn.addEventListener('click', function (e) {
        modalRegistration.classList.add('modal_active');
        submitBtn.addEventListener('click', submitReg);
    })
    document.querySelector('#modal_registration .modal_close').addEventListener('click', function () {
        closeModal(modalRegistration);
        submitBtn.removeEventListener('click', submitReg);
    })
}

// authorization

function authorization(btn) {
    let modalAuth = document.querySelector('#modal_authorization.modal');
    let logInBtn = document.querySelector('#modal_authorization .modal_body .log_in');
    let authError = document.querySelector('#modal_authorization .modal_body .modal_error ul');
    btn.addEventListener('click', function (e) {
        modalAuth.classList.add('modal_active');
    })
    document.querySelector('#modal_authorization .modal_close').addEventListener('click', function () {
        closeModal(modalAuth);
    })
    logInBtn.addEventListener('click', function (e) {
        authError.innerHTML = ``
        let inputs = document.querySelectorAll('#modal_authorization .modal_body input');
        let [email, password, remember] = inputs;
        const usersArr = getLocalData('users_data');
        console.log(usersArr);
        let authValidateObj = {
            email: email.value,
            password: password.value,
            remember: remember.checked
        };
        var usersFilter = usersArr.filter(function (item) {
            if (item['email'] === authValidateObj.email && item['password'] === authValidateObj.password) {
                return item
            }
        })
        console.log(usersFilter)
        if (usersFilter.length > 0) {
            authError.parentNode.style.display = 'none';
            let authUserObject = {};
            Object.assign(authUserObject, usersFilter[0]);
            if (authValidateObj.remember === true) {
                setLocalItem('user_logged', authUserObject);
            } else {
                sessionStorage.setItem('user_logged', JSON.stringify(authUserObject))
            }
            renderAuthUserBlock()
            modalAuth.classList.remove('modal_active');
            inputs.forEach(function (item) {
                item.value = '';
            })
            let mainPage = mainPageContent();
            renderPage(mainPage)
        } else {
            console.log(authError)
            authError.innerHTML = `<li><b>Ошибка авторизации!</b><br/>Неверный e-mail или пароль</li>`
            authError.parentNode.style.display = 'block';
        }
    })

}

// проверка на наличие в базе аватарки
function ifNoAvatar(userAvatar) {
    if (userAvatar !== '') {
        var avatarLink = userAvatar;
    } else {
        var avatarLink = `img/users/default.jpg`;
    }
    return avatarLink
}

// auth block render

function renderAuthUserBlock() {
    let localLoggedData = getLocalUser();
    let userDataBlock = document.querySelector('header .user_settings .user_data');
    if (localLoggedData) {
        let userAvatar = ifNoAvatar(localLoggedData.avatar);
        let dataHtml = `<div class="user-info"><img src="${userAvatar}"><span>${localLoggedData.name}</span></div><button class="log_out default_btn">Выход</button>`
        userDataBlock.innerHTML = dataHtml;
    }
    let userLogOutBtn = document.querySelector('header .user_settings .user_data .log_out');
    if (userLogOutBtn) {
        userLogOutBtn.addEventListener('click', function (e) {
            if (localStorage.getItem('user_logged')) {
                localStorage.removeItem('user_logged');
            }
            if (sessionStorage.getItem('user_logged')) {
                sessionStorage.removeItem('user_logged');
            }
            let dataHtml = `<button class="registration default_btn">Регистрация</button>
                    <button class="authorization default_btn">Авторизация</button>`;
            userDataBlock.innerHTML = dataHtml;
            let regBtn = document.querySelector('header .user_settings .registration');
            registration(regBtn);
            let authBtn = document.querySelector('header .user_settings .authorization');
            authorization(authBtn);
            let mainPage = mainPageContent();
            renderPage(mainPage)
        })
    }
}

function createProject() {
    let projectCreateModal = document.getElementById('project_create'),
        createProject = document.querySelector('.main_container .create_project'),
        projectCreateClose = document.querySelector('#project_create .modal_close'),
        addUserBtn = document.querySelector('#project_create .add_user_btn'),
        createProjectBtn = document.getElementById('create_project');
    createProject.addEventListener('click', function () {
        let main = getLocalData('main')[0];
        projectCreateModal.setAttribute('data-project_id', `${main['projects_count']+ 1}`)
        console.log(getLocalData('main'), main['projects_count'], getLocalData('main')[0]['users_count'])
        projectCreateModal.classList.add('modal_active');
        addUserBtn.addEventListener('click', addUser);
        createProjectBtn.addEventListener('click', createProjectSubmit);
    })
    projectCreateClose.addEventListener('click', function (e) {
        closeModal(projectCreateModal);
        addUserBtn.removeEventListener('click', addUser);
        createProjectBtn.removeEventListener('click', createProjectSubmit);
    })

        function addUser() {
            let addUserBlock = document.querySelector('#project_create .add_user_block');
            let count = +addUserBlock.getAttribute('data-count');
            let newCount = ++count;
            addUserBlock.setAttribute('data-count', `${newCount}`);
            let name = `user-${newCount}`;
            let inputUserBlock = document.createElement('div');
            inputUserBlock.setAttribute('class', 'input_user_block');
            inputUserBlock.setAttribute('data-user', `${name}`);
            let userBlockHtml = `<ul class="input_error"></ul>
                             <span class="remove_user" data-user="${name}"><i class="fa fa-times" aria-hidden="true"></i></span>
                             <div class="input_user_block_container">
                             <div class="flex_column_block">
                             <label for="${name}">Имя кандидата</label>
                             <input type="text" placeholder="Введите имя" name="${name}" id="${name}" data-input="autocomplete">
                             <div class=${name}></div>
                             </div>
                             <div class="flex_column_block">
                             <label for="${name}-position">Должность кандидата</label>
                             <input type="text" placeholder="Введите должность" id="${name}-position" name="${name}-position">
                             </div>
                             </div>`
            inputUserBlock.innerHTML = userBlockHtml;
            addUserBlock.appendChild(inputUserBlock);
            let removeUserBtns = document.querySelectorAll('#project_create .add_user_block .input_user_block .remove_user');
            removeUserBtns.forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    this.parentElement.remove();
                    --count
                    addUserBlock.setAttribute('data-count', `${count}`);
                })
            })
            autocomplete(document.querySelector(`#project_create input[name="${name}"]`), document.querySelector(`#project_create .${name}`), projectCreateModal)
        }

        function createProjectSubmit() {
            let main = getLocalData('main')[0];
            let newProjectObj = {
                project: '',
                project_id: main['projects_count']+ 1,
                project_users: [],
                tasks: []
            }
            let projectUsersData = document.querySelectorAll('#project_create .input_user_block');
            let modalError = document.querySelector('#project_create .modal_error');
            modalError.innerHTML = ``;
            let globalProjectValidateArr = [];
            let usersId = [];
            let usersArr = [];
            if(projectUsersData.length > 0){
                projectUsersData.forEach(function (item) {
                    let userObj = {
                        user_id : 0,
                        user_position: ''
                    }
                    let validateArr = [];
                    let inputs = item.getElementsByTagName("input");
                    let errorBlock = item.querySelector('.input_error');
                    errorBlock.innerHTML = '';
                    if(inputs[0].getAttribute('data-value') !== ''){
                        userObj.user_id = +inputs[0].getAttribute('data-value');
                        usersId.push(+inputs[0].getAttribute('data-value'));
                        validateArr.push(true);
                    }else{
                        errorBlock.innerHTML += '<li>Выберите кандидата</li>';
                        validateArr.push(false);
                    }
                    if(inputs[1].value.length > 0){
                        userObj.user_position = inputs[1].value;
                        validateArr.push(true);
                    }else{
                        errorBlock.innerHTML += '<li>Напишите должность кандидата</li>';
                        validateArr.push(false);
                    }
                    if(!validateArr.includes(false)){
                        usersArr.push(userObj)
                        globalProjectValidateArr.push(true);
                    }else{
                        globalProjectValidateArr.push(false);
                    }
                    console.log(userObj)
                })
                console.log(usersArr);
            }else{
                modalError.style.display = 'block';
                modalError.innerHTML += `<li>Необходимо добавить в проект хотя бы одного участника!</li>`;
            }
            let projectName = document.querySelector('#project_create input[name="project_name"]');

            if(projectName.value.length > 0){
                newProjectObj.project = projectName.value;
                globalProjectValidateArr.push(true);
            }else{
                globalProjectValidateArr.push(false);
                modalError.innerHTML += `<li>Введите название проета</li>`
            }
            let ownerPosition = document.querySelector('#project_create input[name="owner_position"]');
            if(ownerPosition.value.length > 0){
                let owner = getLocalUser();
                console.log(owner);
                let ownerObj = {
                    user_id : owner.id,
                    user_position: ownerPosition.value
                }
                usersId.push(owner.id);
                usersArr.push(ownerObj);
                globalProjectValidateArr.push(true);
            }else{
                globalProjectValidateArr.push(false);
                modalError.innerHTML += `<li>Введите свою должность в проекте</li>`
            }
            if(!globalProjectValidateArr.includes(false)){
                let globalProject = getLocalData('projects_data');
                let getGlobalUsers = getLocalData('users_data');
                let localUser = getLocalUser();
                localUser.projects.push(main['projects_count'] + 1);
                console.log(main);
                if(localStorage.getItem('user_logged')){
                    localStorage.setItem('user_logged', JSON.stringify(localUser));
                }else{
                    sessionStorage.setItem('user_logged', JSON.stringify(localUser));
                }
                getGlobalUsers.forEach(function (item) {
                    if(usersId.includes(item.id)){
                        item.projects.push(newProjectObj.project_id);
                    }
                })
                setLocalItem('users_data', getGlobalUsers)
                newProjectObj.project_users = usersArr;
                globalProject.push(newProjectObj);
                setLocalItem('projects_data', globalProject);
                setMainCount('project');
                let projectInputs = document.querySelectorAll('#project_create input')
                projectInputs.forEach(function (item) {
                    item.value = '';
                });
                let inputUsersBlocks = document.querySelectorAll('#project_create .add_user_block .input_user_block');
                if(inputUsersBlocks.length > 0){
                    inputUsersBlocks.forEach(function (item) {
                        item.remove();
                    })
                }
                closeModal(projectCreateModal)
                loadTasks(newProjectObj.project_id, JSON.parse(sessionStorage.getItem('remember'))['task_select']);
            }
        }
}
// render projects

function renderProjectsList() {
        rememberContent('project_list');
        let localUserData = getLocalUser();
        if (localUserData) {
            if (localUserData.projects.length > 0) {
                let userProjects = localUserData.projects;
                let globalProjects = getLocalData('projects_data');
                let activeProjects = globalProjects.filter(function (item) {
                    if (userProjects.includes(item['project_id'])) {
                        return item
                    }
                })
                let html = `<div class="default_box">
                            <ul class="list_style">`
                for (let i = 0; i < activeProjects.length; i++) {
                    html += `<li class="active_project" data-id="${activeProjects[i]['project_id']}">
                                <h4>${activeProjects[i]['project']}</h4>
                                <button class="default_btn">Перейти в проект</button>
                             </li>`
                }
                html += `</ul>
                             <button class="create_project btn_primary" style="max-width: 400px; margin: 0 auto">Создать проект<i style="margin-left: 10px" class="fa fa-plus-circle" aria-hidden="true"></i></button>
                             </div>`
                renderPage(html)
                let infoProjectsBtn = document.querySelectorAll('.main_container .list_style .active_project button');
                renderTasks(infoProjectsBtn, globalProjects, localUserData)
                createProject()
            } else {
                let html = `<div class="default_block">
                            <p>Вы еще не учавствуете в проектах</p>
                            <button class="create_project btn_primary" style="max-width: 400px; margin: 0 auto">Создать проект<i style="margin-left: 10px" class="fa fa-plus-circle" aria-hidden="true"></i></button>
                            </div>`
                renderPage(html)
                createProject()
            }

        } else {
            let html = `<div class="default_block"><h3>Для того что бы учавствовать в проетах, нужно авторизоваться!</h3>`
            renderPage(html)
        }
}
function viewTask() {
    let viewTaskModal = document.getElementById('view_task');
    let viewTaskBody = viewTaskModal.querySelector('.task_body');
    let viewTaskClose = viewTaskModal.querySelector('.popup_close_btn');
    let globalProject = getLocalData('projects_data');
    let viewTaskBtns = document.querySelectorAll('.project-block .project_task .view_task');
        viewTaskBtns.forEach(item =>{
        item.addEventListener('click', function (e) {
            let tasksArr = [];
            let thisId = +this.getAttribute('data-id');
            globalProject.forEach(function (project) {
                project['tasks'].forEach(function (task) {
                    tasksArr.push(task);
                })
            })
            let currentTaskArr = tasksArr.filter(item => {
                if(item['id'] === thisId){
                    return item
                }
            })
            let currentTask = currentTaskArr[0];
            let taskStatus = taskStatusName(currentTask.status);
            let userSetter = getUser(currentTask.users.setter.id);
            let userExecutor = getUser(currentTask.users.executor.id);
            let userObserver = getUser(currentTask.users.observer.id);
            let html = `<div class="view_task_row"><span>Название задачи: </span><span>${currentTask.title}</span></div>
            <div class="view_task_row"><span>Описание задачи: </span><span>${currentTask.description}</span></div>
            <div class="view_task_row">
            <div class="default_box"><span>Поставил: </span><span>${userSetter}</span></div>
            <div class="default_box"><span>Выполняет: </span><span>${userExecutor}</span></div>
            <div class="default_box"><span>Наблюдает: </span><span>${userObserver}</span></div>
            </div>
            
            <div class="view_task_row"><span>Дата постановки: </span><span>${currentTask.date.start}</span></div>
            <div class="view_task_row"><span>Выполнить до: </span><span>${currentTask.date.deadline}</span></div>
            <div class="view_task_row"><span>Статус: </span><span>${taskStatus}</span></div>`
            viewTaskBody.innerHTML = html;
            viewTaskModal.classList.add('modal_active');
        })
    })

    function getUser(id) {
        let usersArr = getLocalData('users_data');
        let user = usersArr.filter(item => {
            if(item['id'] === id){
                console.log(item['id'], id)
                return item
            }
        })
        let userAvatar = ifNoAvatar(user[0]['avatar']);
        let html = `<img src="${userAvatar}"><span>${user[0]['name']}</span>`
        return html
    }


viewTaskClose.addEventListener('click', viewPopupClose)
    function viewPopupClose() {
        viewTaskModal.classList.remove('modal_active');
        viewTaskBody.innerHTML = '';
        viewTaskClose.removeEventListener('click', viewPopupClose)
    }
}
function loadTasks(id, selectVal) {
    let usersData = getLocalData('users_data');
    let projects = getLocalData('projects_data');
    let localUserData = getLocalUser();
    console.log(selectVal);
    let selectedProjectArr = projects.filter(item => {
        if (item['project_id'] === id) {
            return item
        }
    })
    let selectedProject = selectedProjectArr[0];
    let projectTasks = selectedProject['tasks'];
    var html = `<div class="project-block">
                        <div class="project-info"><h2>${selectedProject['project']}</h2></div>
                        <div class="project_controls">
                        <div class="tasks_filters">`
                        if(selectVal === 1){
                            html +=`<select name="select_tasks" id="select_tasks">
                                            <option value="1" selected="selected">Все</option>
                                            <option value="2">Мои задачи</option>
                                            </select>`
                        }else if(selectVal === 2){
                            html +=`<select name="select_tasks" id="select_tasks">
                                            <option value="1">Все</option>
                                            <option value="2" selected="selected">Мои задачи</option>
                                            </select>`
                        }
                            html +=`</div>
                        <div class="project_edit">
                        <button class="add_user btn_primary"><i class="fa fa-user-plus" aria-hidden="true"></i></button>
                        <button class="add_task btn_primary"><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
                        </div>
                        </div>`;
    if(projectTasks.length > 0){
        for (let i = 0; i < projectTasks.length; i++) {
            let DeadlineString = projectTasks[i]['date']['deadline'];
            let DeadlineStringArr = DeadlineString.split('.');
            let currentDate = new Date();
            let dateEnd = new Date(+DeadlineStringArr[2], +DeadlineStringArr[1] - 1, +DeadlineStringArr[0]);
            let timeLeft = Math.floor((dateEnd - currentDate) / (60 * 1000 * 60 * 24));
            let usersArr = [];
            for (let users in projectTasks[i]['users']) {
                usersArr.push(projectTasks[i]['users'][users]['id'])
            }
            if(selectVal == 1 || undefined){
                shapeTasks()
            }else if(selectVal == 2){
                if (usersArr.indexOf(localUserData['id']) !== -1) {
                    shapeTasks()
                }
            }
            function shapeTasks() {
                if (timeLeft < 0) {
                    html += `<div class="project_task task_time_left" data-id="${projectTasks[i]['id']}">
                                        <span>${projectTasks[i]['title']}</span>
                                        <span>${projectTasks[i]['description']}</span>`
                } else {
                    html += `<div class="project_task" data-id="${projectTasks[i]['id']}">
                                        <span>${projectTasks[i]['title']}</span>
                                        <span>${projectTasks[i]['description']}</span>`
                }
                let setterData = {};
                let executorData = {};
                let observerData = {};
                for (let item = 0; item < usersData.length; item++) {
                    if (usersData[item]['id'] === projectTasks[i]['users']['setter']['id']) {
                        setterData = usersData[item]
                    }
                    if (usersData[item]['id'] === projectTasks[i]['users']['executor']['id']) {
                        executorData = usersData[item]
                    }
                    if (usersData[item]['id'] === projectTasks[i]['users']['observer']['id']) {
                        observerData = usersData[item]
                    }
                }
                let setterAvatar = ifNoAvatar(setterData['avatar']);
                let executorAvatar = ifNoAvatar(executorData['avatar']);
                let observerAvatar = ifNoAvatar(observerData['avatar']);
                html += `<span data-id="${setterData['id']}">Постановщик: <img src="${setterAvatar}">${setterData['name']}</span>`
                html += `<span data-id="${executorData['id']}">Исполнитель: <img src="${executorAvatar}">${executorData['name']}</span>`
                html += `<span data-id="${observerData['id']}">Наблюдатель: <img src="${observerAvatar}">${observerData['name']}</span>`
                if(projectTasks[i]['status'] === 2){
                    html += `<span style="font-weight: bold">Задача выполнена!</span>
                             <span>Дата выполнения: ${projectTasks[i]['date']['completed']}</span>`;
                }else{
                    if (timeLeft < 0) {
                        html += `<span style="font-weight: bold">Задача просрочена!</span>
                             <span>deadline: ${projectTasks[i]['date']['deadline']}</span>`;
                    } else {
                        html += `<span>До конца: ${timeLeft} дня</span>
                             <span>deadline: ${projectTasks[i]['date']['deadline']}</span>`;
                    }
                }

                html += `<div style="display: flex; align-items: center">
                     <button class="view_task btn_primary" style="max-width: 50px" data-id="${projectTasks[i]['id']}"><i class="fa fa-eye" aria-hidden="true"></i></button>`;
                if (timeLeft > 0) {
                    if (executorData['id'] === localUserData['id']) {
                        switch (projectTasks[i]['status']) {
                            case 0:
                                html += `<select name="status" id="status" style="border: 1px solid #c8c8c8; margin-left: 5px">
                                     <option value="0" selected="selected">Поставлена</option>
                                     <option value="1">В работе</option>
                                     <option value="2">Выполнена</option></select>`;
                                break;
                            case 1:
                                html += `<select name="status" id="status" style="border: 1px solid #c8c8c8; margin-left: 5px">
                                     <option value="0">Поставлена</option>
                                     <option value="1" selected="selected">В работе</option>
                                     <option value="2">Выполнена</option></select>`;
                                break;
                            case 2:
                                html += `<select name="status" id="status" style="border: 1px solid #c8c8c8; margin-left: 5px" disabled>
                                     <option value="0">Поставлена</option>
                                     <option value="1">В работе</option>
                                     <option value="2" selected="selected">Выполнена</option></select>`;
                                break;
                            default:
                                html += `<select name="status" id="status" style="border: 1px solid #c8c8c8; margin-left: 5px">
                                     <option value="0" selected="selected">Поставлена</option>
                                     <option value="1">В работе</option>
                                     <option value="2">Выполнена</option></select>`;
                        }
                        html += `</div></div>`;
                    } else {
                        var statusText = taskStatusName(projectTasks[i]['status']);
                        html += `<span style="margin-left: 5px" data-status="${projectTasks[i]['status']}">${statusText}</span></div></div>`;
                    }
                } else {
                    html += `<span style="margin-left: 5px" data-status="3">Просрочена</span></div></div>`;
                }
            }
        }
    }else{
        html += `<h3 style="text-align: center">В этом проекте еще нет поставленных задач задач</h3>`
    }
    html += `</div>`;
    renderPage(html);
    addTask(id, localUserData);
    let projectStatusSelect = document.querySelectorAll('.project-block .project_task select[name="status"]');
    setTaskStatus(projectStatusSelect, id, projects);
    let select = document.getElementById('select_tasks');
    rememberContent('project_data', id, 'project', JSON.parse(sessionStorage.getItem('remember'))['task_select']);
    select.addEventListener('change', function (e) {
        rememberContent('project_data', id, 'project', +select.value);
        loadTasks(id, +select.value)
    })
    viewTask()
}
function taskStatusName(data) {
    let statusText = ``;
    switch (data) {
        case 0:
            statusText = `Поставлена`
            break
        case 1:
            statusText = `В работе`
            break
        case 2:
            statusText = `Выполнена`

            break
        default:
            statusText = `Статус неизвестен`
    }
    return statusText
}
function setTaskStatus(selects, projectId, prjArr) {
    selects.forEach(function (select) {
        select.addEventListener('change', function (e) {
            let taskId = this.closest('.project_task').getAttribute('data-id');
            let currentProject = prjArr.filter(function (project) {
                if (project['project_id'] === projectId) {
                    return project
                }
            })
            let tasks = currentProject[0]['tasks'];
            let taskIndex;
            let changedTask = tasks.filter(function (item, index) {
                if (item['id'] === +taskId) {
                    taskIndex = index;
                    return index
                }
            })
            let newStatus = +e.target.value;
            let dateComplete = dateToStr(new Date());
            changedTask[0]['date']['completed'] = dateComplete;
            changedTask[0]['status'] = newStatus;
            setLocalItem('projects_data', prjArr);
            loadTasks(projectId, JSON.parse(sessionStorage.getItem('remember'))['task_select']);
        })
    })

}

// рендер списка проектов
function renderTasks(btn, projects, localUser) {
    console.log(localUser)
    btn.forEach(function (item) {
        item.addEventListener('click', function (e) {
            let projectId = +item.parentNode.getAttribute('data-id');
            // console.log(JSON.parse(sessionStorage.getItem('remember')['task_select']));
            loadTasks(projectId, JSON.parse(sessionStorage.getItem('remember'))['task_select']);
        })
    })
}

function addTask(id, user) {
    let addTaskBtn = document.querySelector('.project-block .project_controls .add_task')
    addTaskBtn.addEventListener('click', function (e) {
        let popupCreateTask = document.getElementById('task_create');
        popupCreateTask.style.display = 'block';
        let taskIdBlock = document.querySelector('#task_create .new_task_form');
        taskIdBlock.setAttribute('data-project_id', id)
        let createTaskCloseBtn = document.querySelector('#task_create .popup_close_btn');
        createTaskCloseBtn.addEventListener('click', function (e) {
            closePopup('task_create');
            taskCreateBtn.removeEventListener('click', createTask);
        })
        let inputsAutocomplete = document.querySelectorAll('input[data-input="autocomplete"]');
        inputsAutocomplete.forEach(function (item) {
            autocomplete(item, document.querySelector(`.${item.name}`), taskIdBlock)
        })
        let taskCreateBtn = document.querySelector('.popup_create .btn_create_task')
        taskCreateBtn.addEventListener('click', createTask);
        function createTask() {
            let mainLocalItemTasks = JSON.parse(localStorage.getItem('main'))[0]['tasks_count'];
            let currentDate = new Date();
            let currentDateStr = dateToStr(currentDate);
            console.log(currentDateStr)
            let newObjectTask = {
                status: 0,
                date: {
                    start: currentDateStr,
                    deadline: '',
                    complete: '',
                },
                description: '',
                id: ++mainLocalItemTasks,
                title: '',
                users: {
                    setter: {
                        id: user.id
                    },
                    observer: {
                        id: 0
                    },
                    executor: {
                        id: 0
                    }
                },
            }
            let validateTask = []
            let inputs = document.querySelectorAll('.new_task_form input');
            let popup_error = document.querySelector('.new_task_form .modal_error');
            popup_error.innerHTML = ``;
            inputs.forEach(function (input) {
                if (input.getAttribute('data-input') === "autocomplete") {
                    if (input.getAttribute('data-value') !== '') {
                        newObjectTask.users[input.getAttribute('name')]['id'] = +input.getAttribute('data-value');
                        validateTask.push(true);
                    } else {
                        validateTask.push(false);
                    }
                } else {
                    if (input.value.length > 3) {
                        if (input.getAttribute('name') === 'deadline') {
                            console.log('deadline true')
                            let deadline = input.value;
                            console.log(input.value)
                            let deadlineArr = deadline.split('-');
                            let strDeadline = `${deadlineArr[2]}.${deadlineArr[1]}.${deadlineArr[0]}`
                            newObjectTask.date.deadline = strDeadline;
                            validateTask.push(true);
                        }
                        if (input.getAttribute('name') === 'title') {
                            console.log('title true')
                            validateTask.push(true);
                            newObjectTask.title = input.value;
                        }
                    } else {
                        validateTask.push(false);
                    }
                }
            })
            newObjectTask.description = document.querySelector('.new_task_form textarea').value;
            if (validateTask.indexOf(false) === -1) {
                let localProjects = getLocalData('projects_data');
                console.log(id)
                let currentProjectIndex = 0;
                let currentProject = localProjects.filter(function (item, index) {
                    if (item['project_id'] === id) {
                        currentProjectIndex = index;
                        return item
                    }
                })
                let currentProjectTasks = currentProject[0]['tasks'];
                currentProjectTasks.push(newObjectTask);
                localProjects[currentProjectIndex] = currentProject[0];
                setLocalItem('projects_data', localProjects);
                setMainCount('task');
                popupCreateTask.style.display = 'none';
                loadTasks(id,JSON.parse(sessionStorage.getItem('remember'))['task_select'])
            } else {
                popup_error.innerHTML = `Ошибка! Пожалуйста, заполните все поля!`;
            }
        }
    })
}

function setMainCount(name) {
    let mainJson = getLocalData('main')[0];
    ++mainJson[`${name}s_count`];
    setLocalItem('main', [mainJson]);
}

function dateToStr(date) {
    var currentMonth = `${date.getMonth() + 1}`
    if (date.getMonth() + 1 < 10) {
        currentMonth = `0${date.getMonth() + 1}`
    }
    let dateStr = `${date.getDate()}.${currentMonth}.${date.getFullYear()}`
    return dateStr
}

function closePopup(elemId) {
        let popupBlock = document.getElementById(elemId);
        popupBlock.style.display = 'none';
        let inputs = document.querySelectorAll(`#${elemId} input`);
        let textAreas = document.querySelectorAll(`#${elemId} textarea`);
        let selects = document.querySelectorAll(`#${elemId} select`);
        let itemsArr = [inputs, textAreas, selects];
        (function (arrays) {
            console.log('arrays-->>', arrays)
            arrays.forEach(function (arr){
                console.log('arr-->>', arr)
                arr.forEach(function (item) {
                    console.log('item-->>', item)
                    item.value = '';
                })
            })
        })(itemsArr)
}

function closeModal(block) {
    console.log(block)
        block.classList.remove('modal_active');
}

// автозаполнение полей данными
function autocomplete(elem, block, taskIdBlock) {
    elem.addEventListener('input', function (e) {
        let taskID = +taskIdBlock.getAttribute('data-project_id');
        let main = getLocalData('main')[0];
        let currentUser = getLocalUser();
        let usersData = getLocalData('users_data');
        let autocomplete = document.querySelector('.autocomplete_list');
        let value = e.target.value;
        console.log(taskID, main)
        if(taskID <= main['projects_count']){
            console.log('true')
            var dataItems = usersData.filter(function (item) {
                if (value.length > 2 && item.name.includes(value) === true && item.projects.includes(taskID) === true) {
                    return item
                }
            })
        }
        else if(taskID > main['projects_count']){
            var dataItems = usersData.filter(function (item) {
                console.log(item, currentUser)
                if(value.length > 2 && item.name.includes(value) && item.id !== currentUser['id']){
                    return item
                }
            });
        }
        console.log(elem)
        if (dataItems.length > 0) {
            let autocompleteList = document.createElement('ul');
            autocompleteList.classList.add('autocomplete_list');
            let html = ``;
            dataItems.forEach(function (item) {
                if (item.avatar === '') {
                    var avatar = `img/users/default.jpg`
                } else {
                    var avatar = item.avatar
                }
                html += `<li data-id="${item.id}"><img src="${avatar}"><span class="name">${item.name}</span></li>`
            })
            elem.style.position = 'relative';
            if (autocomplete) {
                autocompleteList.innerHTML = html;
                selectAutocomplete(elem);
            } else {
                autocompleteList.innerHTML = html;
                block.appendChild(autocompleteList);
                selectAutocomplete(elem);
            }
        } else {
            if (autocomplete) {
                autocomplete.remove();
            }
        }
    })
}

function selectAutocomplete(input) {
    let users = document.querySelectorAll('.autocomplete_list li');
    users.forEach(function (item) {
        item.addEventListener('click', function (e) {
            input.setAttribute('data-value', item.getAttribute('data-id'));
            input.value = item.children[1].textContent;
            item.parentElement.remove()
        })
    })
}
