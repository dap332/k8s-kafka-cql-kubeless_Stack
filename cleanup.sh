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

kubeless --namespace cql trigger http delete create-trigger
kubeless --namespace cql trigger http delete drop-trigger

kubeless --namespace cql trigger kafka delete insert-trigger
kubectl delete -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kubeless-$kubeless_version.yaml

kubectl delete -f https://github.com/kubeless/kubeless/releases/download/$RELEASE/kafka-zookeeper-$RELEASE.yaml

kubectl delete namespace producer

kubectl delete ns kubeless

kubectl delete ns cql

helm delete --purge "cassandra"

kubectl delete ns cassandra
