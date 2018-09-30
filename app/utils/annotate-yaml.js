export default function annotateYaml(messages = [], yaml) {
  return messages.reduce((annotations, message) => {
    let line = yamlKeyFinder(yaml, message.key);

    if (line === 0 || line) {
      annotations.push({
        message, line
      });
    }

    return annotations;
  }, []);
}

function yamlKeyFinder(yaml, key) {
  let lines = yaml.split('\n');

  return key.split('.').reduce((startingLine, subkey) => linesKeyFinder(lines, subkey, startingLine), 0);
}

function linesKeyFinder(lines, key, startingLine) {
  let foundLine = lines.slice(startingLine).findIndex(line => line.match(new RegExp(`^\\s*${key}`)));

  if (foundLine > -1) {
    return foundLine + startingLine;
  } else {
    return null;
  }
}
