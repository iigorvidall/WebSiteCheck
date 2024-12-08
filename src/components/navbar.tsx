import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [activeTab, setActiveTab] = useState('clients')

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Site Verifier</div>
        <div className="space-x-4">
          <Button
            variant={activeTab === 'clients' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('clients')}
          >
            <Link href="/clients">
              <span className={activeTab === 'clients' ? 'text-white' : 'text-gray-300'}>Clientes</span>
            </Link>
          </Button>
          <Button
            variant={activeTab === 'admins' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('admins')}
          >
            <Link href="/admins">
              <span className={activeTab === 'admins' ? 'text-white' : 'text-gray-300'}>Administradores</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

