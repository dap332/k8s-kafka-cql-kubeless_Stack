# k8s-kafka-cql-kubeless_Stack

#### Easy automated setup and cleanup for deploying a poc for kubernetes cluster
---

### Prerequisites
  - Must have a kubernetes cluster configured and have its kubeconfig file to reach it
  - Must have the kubectl, and kubeless clients installed for your OS and architecture
  - Must have UNIX environment
  - Must have configured an Nginx ingress controller and backend for the cluster
  - Must have NodeJS v8 or higher on your client machine
  
### Config
  ##### The configurations are in a file *source_me*. To create your own *source_me* config file, copy the example source me file and change the values to your configs.
  You can do that with the following command.
  ```bash
  cp source_me.example ./source_me
  ```
  ##### The configurations for the ingress are in the templates/producer-ingress.yaml.example but must be configured with YOUR host.
  You can fo that with the following command.
  ```bash
  cp templates/producer-ingress.yaml.example templates/producer-ingress.yaml
   ```
   Next you must open the ingress file `vim templates/producer-ingress.yaml` and edit to change the *host* property to your host with producer being the subdomain. E.G. *producer.example.com*
   
  ### The configurations for the client at client/insertPost.js must be configured with YOUR host. Simply open the file and change the host property to your hostname
  
  ##### Once you have finished configuring the files, open *source_me* and change the configurations as needed.
    - `KUBECONFIG` is the path to your kubeconfig file which contains the details for kubectl to connect to your cluster
    - `RBAC` can be set to *true*, *false*, or *openshift* depending on the configuration of your cluster
    - `KAFKA_TOPIC` is the name of the topic you want to create and or push/pull from in your cluster
    - `HOST` is the hostname where your endpoints will be for the applications in your cluster
    - `CASSANDRA_CLUSTER_SIZE` is exactly what it sounds like. Its how many nodes you want your cassandra ring to have.
    
### Launching
  Really you just need to do this and wait:
  ```bash
  ./deploy.sh
  ```
  
  You can check on your cluster afterwards with this:
  
  ```bash
  kubectl get pods --all-namespaces
  ```
  
  Here you will see all pods deployed (and some still being deployed)
  
  ##### Once pods have finished deploying, you can test with the client.
  ```bash
   cd client
   node insertPost.js
  ```
  
### Cleanup/Undo
  If you have already deployed, you can clean it all up with this:
  ```bash
  ./cleanup.sh
  ```
  
  #### Note: Due to the time it takes kubernetes to add and remove resources, for best results, the cleanup and deploy scripts should not be run back to back without allowing a few minutes between runs.
