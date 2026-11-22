pipeline {
    agent any
    
    environment {
        EXPO_PUBLIC_SUPABASE_URL      = 'https://placeholder.supabase.co'
        EXPO_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-anon-key'
    }
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

                bat 'npx expo export --platform android'
            }
        }
    }

    post {
        success { echo 'ShopMate build SUCCESS' }
        failure { echo 'ShopMate build FAILED' }
        always  { archiveArtifacts artifacts: 'dist/**', allowEmptyArchive: true }
    }
}