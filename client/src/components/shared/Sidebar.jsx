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

export default function Sidebar() {
  const { user } = useAuthStore();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
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
  );
}
