# Chạy máy chủ Phòng tập piano trong Docker. Dữ liệu nằm ở /data (gắn ổ đĩa để giữ lâu dài).
FROM node:20-alpine
WORKDIR /app
COPY . .
ENV PORT=8080 DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 8080
CMD ["node", "tools/serve.js"]
