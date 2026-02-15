#!/bin/bash
# This will show you the curl command to create the repo
echo "To create the GitHub repo, run this command:"
echo ""
echo "curl -X POST -H 'Authorization: token YOUR_GITHUB_TOKEN' \\"
echo "  -d '{\"name\":\"mt-hood-ski-dashboard\",\"description\":\"Real-time Mt Hood ski dashboard with weather, snowfall data, and trip planning\",\"public\":true}' \\"
echo "  https://api.github.com/user/repos"
echo ""
echo "Or just create it manually at: https://github.com/new"
echo "Repository name: mt-hood-ski-dashboard"
echo "Make it Public, don't add README/gitignore/license"
