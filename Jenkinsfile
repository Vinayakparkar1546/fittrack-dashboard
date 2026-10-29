
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'fittrack-dashboard'
        K8S_DEPLOYMENT = 'fittrack-deployment'
        K8S_CONTAINER = 'fittrack'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Validate Application') {
            steps {
                sh '''
                    set -eu
                    node --check server.js
                    test -f public/index.html
                    test -f public/style.css
                    test -f public/script.js
                    echo "Application files and syntax validated."
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Load Image into Minikube') {
            steps {
                sh '''
                    minikube image load ${IMAGE_NAME}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl set image deployment/${K8S_DEPLOYMENT} \
                      ${K8S_CONTAINER}=${IMAGE_NAME}:${BUILD_NUMBER}

                    kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                      --timeout=180s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    kubectl get deployment ${K8S_DEPLOYMENT}
                    kubectl get pods -l app=fittrack
                    kubectl get service fittrack-service
                '''
            }
        }
    }

    post {
        success {
            echo 'FitTrack pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs to identify the issue.'
        }
    }
}
