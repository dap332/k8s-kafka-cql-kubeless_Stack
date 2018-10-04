#!/usr/bin/env bash

source $(pwd)/source_me

export KUBECONFIG=$KUBECONFIG

kubectl create namespace producer

kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:default


helm init

#Kubeless Release Version
RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)

echo "Release-$RELEASE"

if [ "$RBAC" = true ]; then
        kubeless_version=$RELEASE
elif [ "$RBAC" = false ]; then
        kubeless_version="non-rbac-$RELEASE"
else
        kubeless_version="openshift-$RELEASE"
fi

kubectl create ns cql

kubectl create ns kubeless

kubectl create ns sentiment

#Let's download the Custom Resource Definition
kubectl create -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$kubeless_version.yaml

kubectl create -f https://github.com/kubeless/kafka-trigger/releases/download/$RELEASE/kafka-zookeeper-$RELEASE.yaml --validate=false

#We  won't attempt to do an 'kubeless' commands until the all the kubeless CRD's are installed
count=$(kubectl get crd | grep -c "kubeless.io")

while [ $count -ne 4 ]; do
	echo "CRD's not quite ready yet..."
	sleep 10
done;
echo "deployed CRD's"

# Kubeless Functions 

kubeless function deploy createcql --runtime nodejs8 --handler cql.create --from-file src/cql.js --dependencies src/package.json --namespace cql

kubeless function deploy dropcql --runtime nodejs8 --handler cql.drop --from-file src/cql.js --dependencies src/package.json --namespace cql

kubeless function deploy insertcql --runtime nodejs8 --handler cql.insert --from-file src/cql.js --dependencies src/package.json --namespace cql

kubeless function deploy predict --runtime nodejs8 --handler sentiment.predict --from-file src/sentiment.js --namespace sentiment --dependencies src/package.json

echo "deploying resources: Service, Deployment, and Ingress..."

kubectl -n producer apply -f $(pwd)/templates/producer-deployment.yaml
kubectl -n producer apply -f $(pwd)/templates/producer-svc.yaml
kubectl -n producer apply -f $(pwd)/templates/producer-ingress.yaml
kubectl -n sentiment apply -f $(pwd)/templates/sentiment-deploy.yaml
kubectl -n sentiment apply -f $(pwd)/templates/sentiment-svc.yaml

#Cassandra

#helm repo add incubator https://kubernetes-charts-incubator.storage.googleapis.com/

#helm install --namespace "cassandra" -n "cassandra" incubator/cassandra --set config.cluster_size=$CASSANDRA_CLUSTER_SIZE

helm install --namespace "cassandra" -n "cassandra" ./cassandra

kubectl apply -f $(pwd)/templates/cassandra-job.yaml


# Kubeless Triggers

kubeless trigger kafka create predict-trigger --function-selector function=predict --trigger-topic $KAFKA_TOPIC --namespace sentiment
 
kubeless trigger http create create-trigger --function-name createcql --hostname "create.$HOST" --namespace cql

kubeless trigger http create drop-trigger --function-name dropcql --hostname "drop.$HOST" --namespace cql

kubeless trigger kafka create insert-trigger --function-selector function=insert --trigger-topic insert-topic --namespace cql
