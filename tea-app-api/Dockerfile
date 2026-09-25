FROM ruby:3.3.5-slim

# Tools needed to compile gems with native extensions (pg, psych, etc.)
RUN apt-get update && apt-get install -y build-essential libpq-dev libyaml-dev

WORKDIR /backend

# installing dependencies
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]
