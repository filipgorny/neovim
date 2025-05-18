# admin-courses

The application allows to assign some admins to specific courses (SASSEK). These admins will see only a subset of exams that are connected to given courses. They will be also able to monitor only these specific exams. Only the Master Admin can assign admins to courses.

## Routes
`POST /admin-courses/admin/:admin_id/course/:course_id/toggle`

Toggle admin's assignment to a course.

## Related DB tables
- `admin_courses`
- `admins`
- `courses`
