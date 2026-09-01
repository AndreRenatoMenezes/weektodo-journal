# Changelog — WeekToDo Journal

Este projeto e um fork de [WeekToDo](https://github.com/manuelernestog/weektodo)
(GPL-3.0). As entradas sob "Fork" registram as modificacoes feitas em relacao a
obra original, conforme exige a secao 5a da GPL-3.0. As entradas abaixo de
"Historico do WeekToDo original" sao do projeto de origem.

## Fork — nao publicado
Set 1, 2026

- Fork criado a partir do WeekToDo v2.2.0
- Identidade do fork nos metadados: `package.json` (nome, autor, repositorio,
  `license: GPL-3.0-only`), `vue.config.js` (appId e productName),
  `public/index.html`, `public/manifest.json`, `docker-compose.yml`
- Adicionado `NOTICE` com atribuicao a obra original e registro de modificacoes
- README, CONTRIBUTING e SECURITY reescritos para o fork, mantendo os creditos
  ao autor original
- `.github/FUNDING.yml` limpo (apontava para o financiamento do projeto original)
- `.github/workflows/release.yml` passa a publicar releases neste repositorio,
  e nao no repositorio do projeto original
- Removido do `netlify.toml` o redirect para o dominio do projeto original
- Novo `src/appConfig.js` centralizando identidade e endpoints externos
- Desativadas as chamadas automaticas aos servidores do projeto original:
  verificacao de atualizacao (`App.vue`) e API de patrocinadores
  (`splashScreen.vue`) agora dependem de endpoints proprios em `appConfig`
- Modal Sobre exibe a atribuicao "Fork of WeekToDo by Manuel Ernesto Garcia -
  GPL-3.0" e aponta para o repositorio deste fork
- Adicionados `CLAUDE.md` e a pasta `.claude/` com a documentacao do projeto

## Historico do WeekToDo original

## v2.2.0
Feb 14, 2024

- Adding Print and Export PDF Feature
- Adding new sidebar submenu
- To-do detail view textarea with dynamic height
- Adding Rebranding
- Using Sentry for error handle
- Fixing move old tasks to current day
- Adding recurring task filter
- Adding Month days recurring tasks
- Fixing typos and improving translations
- Adding Hindi, Vietnamese and Hebrew
- Adding Docker config To run the development web version
- Moving CI/CD to Github Actions


## v2.1.0
Jun 3, 2023

- Fixing Bugs
- Improving app performance
- Refactoring config menu
- Adding new colors to tasks color picker
- Upgrading all tech stack libraries
- Adding new repeating event option for custom weekdays selector
- Improving splash screen
- Adding sent subtask to bottom on complete setting
- Todo Description markdown link now redirect to external link in web browser
- Adding week start on monday setting
- Improving Chinese and Russian languages
- Close todoModal with Escape Key


## v2.0.0
Nov 24, 2022

- Adding telemetric system
- Adding custom list columns count setting
- Adding compact and expanded view settings
- Calendar start in today date if old items move automatically
- Adding new task list action
- Fixing Bugs
- Moving changelog, contributors, and support us views to web site
- Creating New Website
- Changing license to GNU GPL 3
- Adding Weekdays to recurrent events
- Adding Automatic Reorder Task Option
- Adding Setting to start week Yesterday
- Creating new Behavior Setting Menu
- Adding time to Copy task list action
- Improving contrast for old items/ checked tasks
- Raplacing name WeekToDo for WeekToDo
- improving dark theme switchers btn
- Adding details to recurrent events frecuency

## v1.9.0
Jul 28, 2022

- Disabling temporary offline version for browser for compatibility problems
- Changing Dynamically Tray menu language
- New setting for change Tray icon color
- Adding blur effect to windows background
- Adding exporting message
- Adding background image when no option selected in main view
- Adding clickable links for task texts
- Tasks details dynamic position
- Task details now show over center separator
- Adding Korean language
- Compacting sidebar
- Adding copy list to clipboard option
- Fixing initial notification bug
- Fixing importing bug from old versions
- Fixing edit task in main view bug
- Fixing bug for adding new task on the bottom of the list
- Fixing welcome modal layout bug
- Fixing problem with initial version notifications
- Fixing bug in subtask reorder in main view

## v1.8.5
Jul 08, 2022

- Fixing incompatible style option for Firefox
- Hiding zoom option for Firefox
- Fixing initial load bug for old task and notifications
- Adding view for swap custom lists
- Adding option to quickly maximize / restore main panels
- Adding undo options for remove tasks
- Adding confirmation modal for remove repeating events
- Improving list headers style
- Adding menu to list headers
- Adding option to Reorder tasks lists
- Adding option to Clear tasks lists
- Adding offline availability for web browser
- Adding option to install app from browser
- Fixing bug in automatic movement of old tasks

## v1.8.0
Jun 27, 2022

- Adding repeating tasks
- Adding repeating tasks view
- Fixing todo lists length when the column grows
- Improving listing performance
- Restyling Modal components
- Restyling To-do hover efect
- Fixing bug moving to-do to date in modal
- Building .Pacman format app for arch distributions
- Adding option for move automatically old tasks
- Moving checked tasks to the bottom of the list
- Showing contribute modal after 7 days of use
- Improving contribute modal
- Fixing Config menu sync with welcome modal
- Adding importing alert

## v1.7.0
Apr 09, 2022

- Open task detail with middle click
- Opening app automatic on startup
- Adding app tray system
- Closing app in background
- Improving windows position function
- Refactoring Config Menu UI
- Adding Notification Options
- Adding Reset Data Option
- Fixing bug in task clock icon
- Adding notification on Startup
- Adding custom sound to notification
- Improving donate view
- Minior UI improvment
- Adding notifications to task
- Adding data clear confirmation modal
- Fixing traditional Chinese
- Adding simplified Chinese translation
- Bulding PKG for MacOS

## v1.6.1
Feb 17, 2022

- Fixing major bug in modal detail sub-task field edit action
- Fixing minors bugs
- Adding time to task detail
- Adding time to task item in main view

## v1.6.0
Feb 06, 2022

- Edit release
- Delete release
- Fixing problem with Polish languages selection
- Adding color picker
- Adding circles and checked circles to tasks
- Fixing problem with calendar for Arabic, Polish and Italian
- Refactoring donate View
- Adding social links to about view
- Refactoring Contributor Modal
- Adding Sponsor Modal
- Adding Collaborator Modal
- Adding Contributor / Sponsor web page
- Adding Sponsors to Main Website
- Adding Sponsors to Splash Screen

## v1.5.0
Jan 03, 2022

- Adding Arabic, Italian and Polish languages
- Adding contributors section
- Fixing style problems in task details
- Adding duplicate and remove task in details form
- Redirecting to new Domain Name
- Updating contribute section

## v1.4.0
Sep 17, 2021

- Fixing drag and drop error on task quick editing
- Adding details to tasks
- Adding sub-tasks
- Creating sub-task drag and drop
- Introducing MarkDown to task Notes
- Adding Honney Badger for exception capture

## v1.3.0
Jul 27, 2021

- Fixing Germany errors
- Adding setting to hide Calendar
- Adding setting to change columns count
- Adding setting to change view zoom
- Fixing columns align bug
- Fixing drag and drop bug
- Adding Resizable view divider
- Resizable view divider double click set size to default

## v1.2.0
Jul 02, 2021

- Performance improvements
- Fixing bugs
- Implementing macOS compatibility
- Generating macOS desktop application
- Adding Sponsor space in splash screen
- Updating Contribute View
- Configuring continuous integration and continuous deployment tool for futures release

## v1.1.0
May 17, 2021

- Adding smooth animations
- Adding animation to drag and drop
- Refactoring donation menu
- Refactoring about view
- Adding changelog view
- Adding check for update option for desktop version
- Improving User Interface elements
- Adding Germany languag

## v1.0.0
Apr 02, 2021

- Initial release