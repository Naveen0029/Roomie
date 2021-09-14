var myHeap={
    
    upheapify:function(heap,idx){
    if(idx<=0)return;
    var pi=Math.floor((idx-1)/2);
    if(heap[pi].first<heap[idx].first){
        var temp=heap[pi];
        heap[pi]=heap[idx];
        heap[idx]=temp;
       this.upheapify(heap,pi);
    }
    else return;

},
downheapify:function(heap,idx){

    var lc=2*idx+1;
    var rc=2*idx+2;
    if(lc>=heap.length&&rc>=heap.length)return;
    var largest=idx;
    if(lc<heap.length&&heap[lc].first>heap[largest].first){
        largest=lc;
    }
    if(rc<heap.length&&heap[rc].first>heap[largest].first){
        largest=rc;
    }
    if(largest==idx)return;

    var temp=heap[largest];
    heap[largest]=heap[idx];
    heap[idx]=temp;
    this.downheapify(heap,largest);
},
push_heap:function(heap,val,key){
 
    var ob={"first":val,"second":key};
    heap.push(ob);
    this.upheapify(heap,heap.length-1); 
    
},
pop_heap:function(heap){

    if(heap.length==0)return;
    var i=heap.length-1;
    var temp=heap[0];
    heap[0]=heap[i];
    heap.pop();
    this.downheapify(heap,0);

},
heap_top:function(heap){
    
    if(heap.length==0){
        return;
    }
    return heap[0];
}


}

export {myHeap};