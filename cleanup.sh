#!/usr/bin/env bash

source $(pwd)/source_me

export KUBECONFIG=$KUBECONFIG



RELEASE=$(curl -s https://api.github.com/repos/kubeless/kubeless/releases/latest | grep tag_name | cut -d '"' -f 4)

if [ "$RBAC" = true ]; then
        kubeless_version=$RELEASE
elif [ "$RBAC" = false ]; then
        kubeless_version="non-rbac-$RELEASE"
else 
        kubeless_version="openshift-$RELEASE"
fi


kubectl delete function -n cql insertcql
kubectl delete function -n cql createcql
kubectl delete function -n cql dropcql

kubectl delete function -n sentiment predict

kubeless --namespace cql trigger http delete create-trigger
kubeless --namespace cql trigger http delete drop-trigger

kubectl -n sentiment delete kafkatrigger predict-trigger

kubectl -n cql delete kafkatrigger insert-trigger

kubectl delete -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$kubeless_version.yaml

kubectl delete -f https://github.com/kubeless/kafka-trigger/releases/download/$RELEASE/kafka-zookeeper-$RELEASE.yaml

kubectl delete namespace producer

kubectl delete ns kubeless

kubectl delete ns cql

kubectl delete ns sentiment

helm delete --purge "cassandra"

kubectl delete ns cassandra
