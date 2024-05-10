import {verify} from 'rust-edge-lambda';

const main = () => {
  console.log(verify('hello world!'))
}

main();