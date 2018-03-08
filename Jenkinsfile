#!/usr/bin/env groovy

import java.text.SimpleDateFormat

DOCKER_GROUP = 'cwds'
DOCKER_APP_IMAGE = 'cals'
DOCKER_TEST_IMAGE = 'cals_acceptance_test'

SUCCESS_COLOR = '#11AB1B'
FAILURE_COLOR = '#FF0000'

def notify(String tagNumber) {
    def colorCode = currentBuild.currentResult == 'SUCCESS' ? SUCCESS_COLOR : FAILURE_COLOR
    def tagMessage = (tagNumber != '') ? "\nDocker tag: ${tagNumber}" : ''

    slackSend(
        color: colorCode,
        message: "${env.JOB_NAME} #${env.BUILD_NUMBER} - *${currentBuild.currentResult}* after ${currentBuild.durationString}" +
            "${tagMessage}" +
            "\n(Details at ${env.BUILD_URL})"
    )
}


def reports() {
    // step([$class: 'JUnitResultArchiver', testResults: '**/reports/*.xml'])
    publishHTML (target: [
        allowMissing: false,
        alwaysLinkToLastBuild: false,
        keepAll: true,
        reportDir: 'reports/coverage/karma',
        reportFiles: 'index.html',
        reportName: 'JS Code Coverage'
    ])

    publishHTML (target: [
        allowMissing: false,
        alwaysLinkToLastBuild: false,
        keepAll: true,
        reportDir: 'reports/coverage/rspec',
        reportFiles: 'index.html',
        reportName: 'Ruby Code Coverage'
    ])
}

def dockerStages(newTag) {
    stage('Docker App Build Publish') {
        curStage = 'Docker App Build Publish'
        pushToDocker(
            "${DOCKER_GROUP}/${DOCKER_APP_IMAGE}:${newTag}",
            "--no-cache -f ./docker/dev/app/cals/dockerfile .",
            DOCKER_CREDENTIALS_ID
            )

    }
    stage('Docker Test Build Publish') {
        curStage = 'Docker Test Build Publish'
        pushToDocker(
            "${DOCKER_GROUP}/${DOCKER_TEST_IMAGE}:${newTag}",
            "--no-cache -f ./docker/dev/app/cals-acceptance-tests/Dockerfile .",
            DOCKER_CREDENTIALS_ID
            )
    }
}

def pushToDocker(imageLocation, args, docker_credential_id) {
    def app = docker.build(imageLocation, args)
    withEnv(["DOCKER_CREDENTIALS_ID=${docker_credential_id}"]) {
        withDockerRegistry([credentialsId: docker_credential_id]) {
            app.push()
            app.push('latest')
        }
    }
}

def getBuildTag() {
    int baseTagNumber = env.BASE_TAG_NUMBER ? env.BASE_TAG_NUMBER.toInteger() : 61
    def baseDate = env.BASE_TAG_DATE ? new SimpleDateFormat("yyyy-MM-dd").parse(env.BASE_TAG_DATE) : new SimpleDateFormat("yyyy-MM-dd").parse("2018-02-21")
    def today = new Date()
    int sprintsSince = (today - baseDate).intdiv(14)

    return getNewTagNumber(baseTagNumber, sprintsSince)
}
def getNewTagNumber(baseTagNumber, sprints) {
    int newTagNumber = baseTagNumber
    sprints.times {
        newTagNumber += 1
        if ((newTagNumber % 10) >= 5) {
            newTagNumber += 6
        }
    }
    return newTagNumber
}

node {
    checkout scm
    env.DISABLE_SPRING = 1

    def branch = env.BRANCH_NAME_PARAM
    def curStage = 'Start'
    def emailList = 'ratnesh.raval@osi.ca.gov'
    def pipelineStatus = 'SUCCESS'
    String newTag = ''

    try {
        stage('Install Dependencies') {
            curStage = 'dependencies'
            echo 'which ruby'
            sh 'which ruby'
            echo 'which bundler'
            sh 'which bundler'
            echo 'which bundle'
            sh 'which bundle'
            sh 'bundle install'
            sh 'yarn install'
        }
        stage('Lint') {
            curStage = 'lint'
            sh 'yarn lint'
        }
        stage('Compile Assets') {
            curStage = 'assets'
            sh 'bundle exec rails assets:precompile RAILS_ENV=test'
        }

        stage('Test - Jasmine') {
            curStage = 'karma'
            sh 'yarn karma-ci'
        }
        stage('Test - Rspec') {
            curStage = 'rspec'
            withEnv([
                'CALS_API_URL=https://calsapi.preint.cwds.io',
                'GEO_SERVICE_URL=https://geo.preint.cwds.io',
                'BASE_SEARCH_API_URL=https://dora.preint.cwds.io',
                'AUTHENTICATION_API_BASE_URL=https://web.preint.cwds.io/perry'
                ]) {
                sh 'yarn spec-ci'
            }
        }

        if (branch == 'development') {
            // push to docker
            newTag = "0.${getBuildTag()}-${env.BUILD_ID}"
            dockerStages(newTag)
        }

        stage ('Reports') {
            reports()
        }
    }
    catch (e) {
        pipelineStatus = 'FAILED'
        currentBuild.result = 'FAILURE'
    }
    finally {
        notify(newTag)
        // cleanWs()
    }
}
