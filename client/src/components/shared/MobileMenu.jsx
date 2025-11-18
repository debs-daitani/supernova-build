import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  BookOpenIcon,
  EnvelopeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Chat with SUPERNova', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon },
  { name: 'Community', href: '/community', icon: UserGroupIcon },
  { name: 'Content Library', href: '/content', icon: BookOpenIcon },
  { name: 'Messages', href: '/messages', icon: EnvelopeIcon },
];

export default function MobileMenu({ isOpen, onClose }) {
  const { user } = useAuthStore();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    dAItaniverse
                  </h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                                  isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                }`
                              }
                            >
                              <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                              {item.name}
                            </NavLink>
                          </li>
                        ))}
                        {user?.isAdmin && (
                          <li>
                            <NavLink
                              to="/admin"
                              onClick={onClose}
                              className={({ isActive }) =>
                                `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                                  isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                                }`
                              }
                            >
                              <Cog6ToothIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                              Admin
                            </NavLink>
                          </li>
                        )}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
