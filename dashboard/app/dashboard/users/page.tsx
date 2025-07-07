import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

const users = [
  {
    id: "user_001",
    telegramUsername: "@john_doe",
    registrationDate: "2023-01-15",
    lastActivity: "2024-07-01",
    status: "Active",
    videosCreated: 15,
  },
  {
    id: "user_002",
    telegramUsername: "@jane_smith",
    registrationDate: "2023-02-20",
    lastActivity: "2024-06-28",
    status: "Active",
    videosCreated: 10,
  },
  {
    id: "user_003",
    telegramUsername: "@bot_tester",
    registrationDate: "2023-03-10",
    lastActivity: "2023-03-10",
    status: "Inactive",
    videosCreated: 1,
  },
  {
    id: "user_004",
    telegramUsername: "@video_creator",
    registrationDate: "2023-04-01",
    lastActivity: "2024-07-04",
    status: "Active",
    videosCreated: 25,
  },
  {
    id: "user_005",
    telegramUsername: "@new_user",
    registrationDate: "2024-06-30",
    lastActivity: "2024-07-05",
    status: "Active",
    videosCreated: 2,
  },
]

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage your Telegram bot users and view their activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." className="w-full rounded-lg bg-background pl-8" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Telegram Username</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Videos Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.telegramUsername}</TableCell>
                <TableCell>{user.registrationDate}</TableCell>
                <TableCell>{user.lastActivity}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell className="text-right">{user.videosCreated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
