/////////
// WIP //
/////////
import {
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
  useState,
  Component,
} from 'react';

export default class Snack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const [open, setOpen] = useState(false);
    setOpen(this.props.open);
    const styles = {
      popup: {
        display: open ? 'block' : 'none',
      },
    };
    return (
      <div className='z-50 fixed left-0 bottom-0 p-4' style={styles.popup}>
        <div className='max-w-xs p-4 bg-gray-500 rounded-lg shadow'>
          <div className='flex w-full h-full items-center justify-between'>
            <div className='pr-6'>
              <span className='text-sm leading-5 text-gray-200 font-semibold'>
                {this.props.message}
              </span>
            </div>
            <button
              className='inline-block text-gray-400 hover:text-gray-300'
              onClick={() => {
                setOpen(false);
              }}>
              <svg width='10' height='10' viewBox='0 0 10 10' fill='none'>
                <path
                  d='M5.93996 5.00001L8.80663 2.14001C8.93216 2.01448 9.00269 1.84421 9.00269 1.66668C9.00269 1.48914 8.93216 1.31888 8.80663 1.19335C8.68109 1.06781 8.51083 0.997284 8.33329 0.997284C8.15576 0.997284 7.9855 1.06781 7.85996 1.19335L4.99996 4.06001L2.13996 1.19335C2.01442 1.06781 1.84416 0.997284 1.66663 0.997284C1.48909 0.997284 1.31883 1.06781 1.19329 1.19335C1.06776 1.31888 0.997231 1.48914 0.997231 1.66668C0.997231 1.84421 1.06776 2.01448 1.19329 2.14001L4.05996 5.00001L1.19329 7.86001C1.13081 7.92199 1.08121 7.99572 1.04737 8.07696C1.01352 8.1582 0.996094 8.24534 0.996094 8.33334C0.996094 8.42135 1.01352 8.50849 1.04737 8.58973C1.08121 8.67097 1.13081 8.7447 1.19329 8.80668C1.25527 8.86916 1.329 8.91876 1.41024 8.95261C1.49148 8.98645 1.57862 9.00388 1.66663 9.00388C1.75463 9.00388 1.84177 8.98645 1.92301 8.95261C2.00425 8.91876 2.07798 8.86916 2.13996 8.80668L4.99996 5.94001L7.85996 8.80668C7.92194 8.86916 7.99567 8.91876 8.07691 8.95261C8.15815 8.98645 8.24529 9.00388 8.33329 9.00388C8.4213 9.00388 8.50844 8.98645 8.58968 8.95261C8.67092 8.91876 8.74465 8.86916 8.80663 8.80668C8.86911 8.7447 8.91871 8.67097 8.95255 8.58973C8.9864 8.50849 9.00383 8.42135 9.00383 8.33334C9.00383 8.24534 8.9864 8.1582 8.95255 8.07696C8.91871 7.99572 8.86911 7.92199 8.80663 7.86001L5.93996 5.00001Z'
                  fill='currentColor'></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
