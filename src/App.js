name: Node.js CI

on:
  push:
    branches: [ "master" ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build --if-present
    - name: Decode and Save SSH Key
      run: |
        echo "${{ secrets.EC2_SSH_KEY }}" | base64 -d > kk.pem || { echo "Failed to decode base64"; exit 1; }
        chmod 600 kk.pem
        echo "SSH key length:"
        wc -c < kk.pem
    - name: Deploy to EC2
      env:
        EC2_HOST: ${{ secrets.EC2_HOST }}
        EC2_USER: ${{ secrets.EC2_USER }}
      run: |
        ssh -v -o StrictHostKeyChecking=no -i kk.pem ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} << 'EOF'
          cd /home/ubuntu/kunj/testdir
          exit
        EOF
