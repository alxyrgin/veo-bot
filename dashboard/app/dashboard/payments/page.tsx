import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const payments = [
  {
    id: "pay_001",
    userId: "user_001",
    telegramUsername: "@john_doe",
    amount: 9.99,
    date: "2024-06-10",
    status: "Paid",
  },
  {
    id: "pay_002",
    userId: "user_002",
    telegramUsername: "@jane_smith",
    amount: 19.99,
    date: "2024-06-15",
    status: "Paid",
  },
  {
    id: "pay_003",
    userId: "user_003",
    telegramUsername: "@bot_tester",
    amount: 4.99,
    date: "2024-03-10",
    status: "Failed",
  },
  {
    id: "pay_004",
    userId: "user_004",
    telegramUsername: "@video_creator",
    amount: 9.99,
    date: "2024-07-01",
    status: "Paid",
  },
  {
    id: "pay_005",
    userId: "user_005",
    telegramUsername: "@new_user",
    amount: 9.99,
    date: "2024-07-05",
    status: "Pending",
  },
]

export default function PaymentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Track payment statuses for your bot's premium features.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search payments..." className="w-full rounded-lg bg-background pl-8" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.telegramUsername}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "Paid" ? "default" : payment.status === "Pending" ? "secondary" : "destructive"
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
