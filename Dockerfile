# syntax=docker/dockerfile:1

FROM node:24-alpine AS client-build
WORKDIR /src/ClientApp
COPY ClientApp/package.json ClientApp/package-lock.json ./
RUN npm ci
COPY ClientApp/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server-build
WORKDIR /src
COPY Server/Server.csproj Server/
RUN dotnet restore Server/Server.csproj
COPY Server/ Server/
COPY --from=client-build /src/ClientApp/dist/ Server/wwwroot/
RUN dotnet publish Server/Server.csproj --configuration Release --output /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=server-build /app/publish ./
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
EXPOSE 10000
USER $APP_UID
ENTRYPOINT ["dotnet", "Server.dll"]

