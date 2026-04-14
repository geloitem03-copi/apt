import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, House, ArrowLeft, Users } from "lucide-react";

interface ApartmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApartmentDetailPage({ params }: ApartmentDetailPageProps) {
  const { id } = await params;

  const rooms = [
    {
      id: "1",
      name: "Room 101",
      type: "Studio",
      price: 4000,
      available: 2,
      description: "Cozy studio unit with private bathroom",
    },
    {
      id: "2",
      name: "Room 102",
      type: "1-Bedroom",
      price: 5500,
      available: 0,
      description: "Spacious 1-bedroom with kitchen area",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">RentalApp</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Apartments
            </Button>
          </Link>

          <div className="border rounded-xl overflow-hidden mb-8">
            <div className="h-64 bg-secondary/20 flex items-center justify-center">
              <Building2 className="h-24 w-24 text-muted-foreground" />
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">tinungan</h1>
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground">mangahan apartment</p>
              </div>
              <p className="text-muted-foreground mb-6">
                dsvdfadffd
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <House className="h-5 w-5" />
                  <span>1 floors</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>2 available</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <p className="text-muted-foreground">{room.type}</p>
                  <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <p className="text-xl font-bold text-primary">₱{room.price.toLocaleString()}/mo</p>
                  {room.available > 0 ? (
                    <div className="flex gap-2">
                      <span className="text-sm text-green-600">{room.available} available</span>
                      <Link href={`/contact?apartment=${id}&room=${room.id}`}>
                        <Button>Inquire</Button>
                      </Link>
                    </div>
                  ) : (
                    <span className="text-sm text-red-600">Fully Occupied</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 RentalApp. Built for the Philippine rental market.
        </div>
      </footer>
    </div>
  );
}
