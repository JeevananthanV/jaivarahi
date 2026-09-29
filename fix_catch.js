const fs = require('fs');
const content = fs.readFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', 'utf8');

// Fix the misplaced catch block - the response code should be in try, not catch
const broken = `    `, [...params, ...params, ...params]);;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message })
    const auditLimit = Math.min(50, Math.max(1, parseInt(req.query.audit_limit) || 10));`;

const fixed = `    `, [...params, ...params, ...params]);;

    const auditLimit = Math.min(50, Math.max(1, parseInt(req.query.audit_limit) || 10));`;

const newContent = content.replace(broken, fixed);
fs.writeFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', newContent, 'utf8');
console.log('Step 1 done');

// Now fix the catch block at the end
const broken2 = `      city_distribution: cityDist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Ashada Navarathiri Dashboard`;

const fixed2 = `      city_distribution: cityDist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Ashada Navarathiri Dashboard`;

const newContent2 = newContent.replace(broken2, fixed2);
fs.writeFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', newContent2, 'utf8');
console.log('Step 2 done');