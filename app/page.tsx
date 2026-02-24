/**
 * Root page - redirects to login
 * This is a placeholder implementation
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}
