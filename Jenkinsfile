pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                bat 'node --version && npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci || npm install'
            }
        }

        stage('Lint (Code Quality)') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Type Check') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    bat 'npx tsc --noEmit'
                }
            }
        }

        stage('Build') {
            steps {
                bat 'npx expo export --platform web'
            }
        }
    }

    post {
        success { echo 'ShopMate build SUCCESS' }
        failure { echo 'ShopMate build FAILED' }
        always  { archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true }
    }
}