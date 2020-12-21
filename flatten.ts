


// const flattenArray = (v: Array<any>) => {
//
//   if(!Array.isArray(v)){
//     return [v]
//   }
//
//   const stack = [...v];
//   const result : Array<any> = [];
//
//   while(stack.length > 0){
//
//     const v = stack.pop();
//
//     if(!Array.isArray(v)){
//       result.push(v)
//       continue
//     }
//
//     stack.push(...v);
//
//   }
//
//   return result;
//
//
// }
//
// const arr = [[],1, 2, [3, 4, [5, 6]]];
// console.log(flattenArray(arr));

const permute = (v: string) : Array<string> => {

  if(v.length < 1){
    return []
  }

  if(v.length <= 1){
    return [v]
  }

  const s : Array<string> = [];

  for(let i = 0; i < v.length; i++){
    let x = '';
    for(let j = 0; j < v.length; j++){
      if(i !== j){
        x+=v[j]
      }
    }
    console.log('v:', v,'x:', x)
    for(let z of permute(x)){
      s.push(v[i] + z)
    }
  }

  return s;
}


// const permute2 = (v: string) : Array<string> => {
//
//   const stack = [v];
//   const results : Array<string> = [];
//   let curr = ''
//
//   while(stack.length > 0) {
//
//     const s = stack.pop() || ''
//
//     if(stack.length < 1){
//       results.push(curr)
//       curr = ''
//     }
//
//     curr = curr + s[0]
//
//     for(let i = 0; i < s.length; i++){
//       let x = '';
//       for(let j = 0; j < s.length; j++){
//         if(i !== j){
//           x+=s[j]
//         }
//       }
//
//       console.log(x);
//       stack.push(x)
//     }
//
//     console.log({stack});
//   }
//
//
//   return results;
// }


const permute2 = (v: string) : Array<string> => {

  const results : Array<string> = [];

  for(let i =0 ; i < v.length; i++){

    const stack = [v];
    let curr = ''

    while(stack.length > 0) {

      const s = stack.pop() || ''

      console.log(s);

      if(s.length <= 1){
        results.push(curr + s)
        continue
      }

      let x = ''
      for(let j = 0; j < s.length; j++){
        if(j !== i){
          x+=s[j]
        }
      }
      stack.push(x)

    }
  }


  return results;
}

console.log(permute2('abcd'))
